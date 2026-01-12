import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CalculationEngine } from '@/utils/calculations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadInfo,
      selectedShapes,
      selectedMaterial,
      selectedEdgeStyle,
      preloadedData,
    } = body;

    if (!leadInfo || !selectedShapes || selectedShapes.length === 0 || !selectedMaterial) {
      return NextResponse.json(
        { error: 'Missing required data: leadInfo, selectedShapes, or selectedMaterial' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create lead with name and email
      const lead = await tx.leads.create({
        data: {
          name: leadInfo.fullName,
          email: leadInfo.email,
          zipCode: leadInfo.zipCode,
          city: leadInfo.city,
        },
      });

      // 2. Calculate total price and prepare quote items data
      let totalPrice = 0;
      const quoteItemsData = [];

      // Cutout prices mapping
      const CUTOUT_PRICES: Record<string, number> = {
        'faucet-cutout': 75,
        'cooktop-cutout': 150,
        'sink-cutout': 150,
      };

      for (const shape of selectedShapes) {
        // Calculate square feet for this shape
        const squareFeet = CalculationEngine.calculateSquareFeet(shape.layout, shape.measurements);

        // Calculate material cost
        const materialCost = squareFeet * selectedMaterial.price_per_sqft;

        // Calculate edge cost
        let edgeCost = 0;
        let edgeLinearFt = 0;
        if (selectedEdgeStyle) {
          const edgeCalculation = CalculationEngine.calculateEdgeLinearFeet(
            shape.measurements,
            shape.wallToggles,
            shape.layout.name
          );
          const finalEdgeCalculation = CalculationEngine.calculateEdgeCost(
            edgeCalculation,
            selectedEdgeStyle
          );
          edgeCost = finalEdgeCalculation.totalEdgeCost;
          edgeLinearFt = finalEdgeCalculation.linearFeet;
        }

        // Calculate cutout costs with actual prices
        let cutoutCost = 0;
        const cutoutsData: Record<string, any> = {};
        if (shape.specification?.cutouts) {
          Object.entries(shape.specification.cutouts).forEach(([cutoutId, quantity]) => {
            const cutoutPrice = CUTOUT_PRICES[cutoutId] || 50;
            const totalCutoutPrice = (quantity as number) * cutoutPrice;
            cutoutCost += totalCutoutPrice;
            
            // Find cutout name from CUTOUT_OPTIONS or use ID
            const cutoutName = cutoutId === 'faucet-cutout' ? 'Faucet Cutout' :
                              cutoutId === 'cooktop-cutout' ? 'Cooktop Cutout' :
                              cutoutId === 'sink-cutout' ? 'Sink Cutout' : cutoutId;
            
            cutoutsData[cutoutId] = {
              quantity: quantity as number,
              price: cutoutPrice,
              name: cutoutName,
              total: totalCutoutPrice,
            };
          });
        }

        // Calculate sink costs
        let sinkCost = 0;
        const sinksData: Record<string, any> = {};
        if (shape.specification?.sinks) {
          Object.entries(shape.specification.sinks).forEach(([sinkId, quantity]) => {
            const sinkPrice = preloadedData?.sinkMap?.[sinkId]?.price ?? 0;
            const totalSinkPrice = (quantity as number) * sinkPrice;
            sinkCost += totalSinkPrice;
            
            const sinkName = preloadedData?.sinkMap?.[sinkId]?.name || sinkId;
            
            sinksData[sinkId] = {
              quantity: quantity as number,
              price: sinkPrice,
              name: sinkName,
              total: totalSinkPrice,
            };
          });
        }

        // Calculate subtotal for this item
        const subtotal = materialCost + edgeCost + cutoutCost + sinkCost;
        totalPrice += subtotal;

        // Calculate width_ft and length_ft from measurements
        const measurements = shape.measurements;
        const widthValues: number[] = [];
        const depthValues: number[] = [];

        Object.keys(measurements).forEach(key => {
          const lowerKey = key.toLowerCase();
          const value = (measurements[key] || 0) / 12; // Convert inches to feet
          
          if (lowerKey.includes('width') || lowerKey === 'widtha' || lowerKey === 'widthb' || lowerKey === 'widthc' || lowerKey === 'widthd' || lowerKey === 'widthe') {
            widthValues.push(value);
          }
          if (lowerKey.includes('depth') || lowerKey === 'deptha' || lowerKey === 'depthb' || lowerKey === 'depthc') {
            depthValues.push(value);
          }
        });

        // Use maximum dimensions, or calculate from area if not available
        const width_ft = widthValues.length > 0 ? Math.max(...widthValues) : 0;
        const length_ft = depthValues.length > 0 ? Math.max(...depthValues) : 0;

        // If we can't determine dimensions, use a reasonable approximation based on area
        const finalWidth = width_ft > 0 ? width_ft : (squareFeet > 0 ? Math.sqrt(squareFeet) : 1);
        const finalLength = length_ft > 0 ? length_ft : (squareFeet > 0 ? Math.sqrt(squareFeet) : 1);

        quoteItemsData.push({
          layout_id: shape.layout.id,
          material_id: selectedMaterial.id,
          edge_style_id: selectedEdgeStyle?.id || null,
          width_ft: finalWidth,
          length_ft: finalLength,
          material_cost: materialCost,
          edge_linear_ft: selectedEdgeStyle ? edgeLinearFt : null,
          edge_cost: selectedEdgeStyle ? edgeCost : null,
          cutout_cost: cutoutCost > 0 ? cutoutCost : null,
          sink_cost: sinkCost > 0 ? sinkCost : null,
          subtotal: subtotal,
          environment: shape.environment,
          measurements: shape.measurements,
          wall_toggles: shape.wallToggles,
          has_backsplash: shape.hasBacksplash || false,
          backsplash_height: shape.backsplashHeight || null,
          cutouts: Object.keys(cutoutsData).length > 0 ? cutoutsData : null,
          sinks: Object.keys(sinksData).length > 0 ? sinksData : null,
          specification: shape.specification || null,
        });
      }

      // 3. Create quote (use first shape's layout_id as primary layout)
      const quote = await tx.quotes.create({
        data: {
          lead_id: lead.id,
          total_price: totalPrice,
          layout_id: selectedShapes[0]?.layout?.id || null,
          material_id: selectedMaterial.id,
        },
      });

      // 4. Create quote items
      const quoteItems = await Promise.all(
        quoteItemsData.map((itemData) =>
          tx.quote_items.create({
            data: {
              quote_id: quote.id,
              ...itemData,
            },
          })
        )
      );

      return {
        lead,
        quote,
        quoteItems,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        quoteId: result.quote.id,
        leadId: result.lead.id,
        totalPrice: result.quote.total_price,
      },
    });
  } catch (error: any) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote', details: error.message },
      { status: 500 }
    );
  }
}


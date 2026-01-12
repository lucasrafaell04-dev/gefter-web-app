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
      // 1. Create lead (without user_id)
      const lead = await tx.leads.create({
        data: {
          user_id: null,
          name: leadInfo.fullName || null,
          zipCode: leadInfo.zipCode || null,
          city: leadInfo.city || null,
        },
      });

      // 2. Calculate total price
      let totalPrice = 0;
      const quoteItemsData = [];

      for (const shape of selectedShapes) {
        // Calculate square feet for this shape
        const squareFeet = CalculationEngine.calculateSquareFeet(shape.layout, shape.measurements);

        // Calculate material cost
        const materialCost = squareFeet * selectedMaterial.price_per_sqft;

        // Calculate edge cost
        let edgeCost = 0;
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
        }

        // Calculate specification costs (cutouts, sinks, etc.)
        let specificationCost = 0;
        if (shape.specification) {
          // Add cutout costs
          Object.entries(shape.specification.cutouts || {}).forEach(([cutoutId, quantity]) => {
            specificationCost += (quantity as number) * 50; // $50 per cutout
          });

          // Add sink costs
          Object.entries(shape.specification.sinks || {}).forEach(([sinkId, quantity]) => {
            const sinkPrice = preloadedData?.sinkMap?.[sinkId]?.price ?? 0;
            specificationCost += (quantity as number) * sinkPrice;
          });
        }

        // Calculate subtotal for this item
        const subtotal = materialCost + edgeCost + specificationCost;
        totalPrice += subtotal;

        // Calculate width_ft and length_ft from measurements
        // Extract width and depth values (handle both camelCase and snake_case)
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
          width_ft: finalWidth,
          length_ft: finalLength,
          subtotal: subtotal,
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


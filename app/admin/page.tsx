'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, DollarSign, ChevronRight, ChevronDown } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

interface DashboardStats {
  totalLeads: number;
  totalQuotes: number;
  totalRevenue: number;
  recentLeads: any[];
}

interface QuoteDetails {
  id: string;
  total_price: number;
  created_at: string;
  quote_items: any[];
  layouts: any;
  materials: any;
}

export default function AdminDashboard() {
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
  const [leadQuotes, setLeadQuotes] = useState<Record<string, QuoteDetails[]>>({});
  const [loadingQuotes, setLoadingQuotes] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalQuotes: 0,
    totalRevenue: 0,
    recentLeads: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const toggleLeadExpansion = async (leadId: string) => {
    const newExpanded = new Set(expandedLeads);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
      // Load quotes if not already loaded
      if (!leadQuotes[leadId]) {
        setLoadingQuotes(prev => new Set(prev).add(leadId));
        try {
          const response = await fetch(`/api/admin/leads/${leadId}/quotes`);
          if (response.ok) {
            const data = await response.json();
            setLeadQuotes(prev => ({ ...prev, [leadId]: data.quotes }));
          }
        } catch (error) {
          console.error('Error loading quotes:', error);
        } finally {
          setLoadingQuotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(leadId);
            return newSet;
          });
        }
      }
    }
    setExpandedLeads(newExpanded);
  };

  return (
    <AdminShell title="Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Leads</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalLeads}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Quotes</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalQuotes}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">
                  ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Leads</h2>
          {stats.recentLeads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No leads yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12"></th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">City</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Zip Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeads.map((lead) => {
                    const isExpanded = expandedLeads.has(lead.id);
                    const quotes = leadQuotes[lead.id] || [];
                    const isLoading = loadingQuotes.has(lead.id);
                    
                    return (
                      <React.Fragment key={lead.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleLeadExpansion(lead.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">{lead.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{lead.email || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{lead.city || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{lead.zipCode || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {lead.created_at
                              ? new Date(lead.created_at).toLocaleDateString()
                              : 'N/A'}
                          </td>
                        </tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="p-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="bg-gray-50 border-t border-gray-200"
                                >
                                  <div className="p-6">
                                    {isLoading ? (
                                      <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                                        <span className="ml-2 text-gray-600">Loading quotes...</span>
                                      </div>
                                    ) : quotes.length === 0 ? (
                                      <p className="text-gray-500 text-center py-4">No quotes found for this lead</p>
                                    ) : (
                                      <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                          Quotes ({quotes.length})
                                        </h3>
                                        {quotes.map((quote) => (
                                          <div
                                            key={quote.id}
                                            className="bg-white rounded-lg p-4 border border-gray-200"
                                          >
                                            <div className="flex justify-between items-start mb-4">
                                              <div>
                                                <h4 className="font-semibold text-gray-800">
                                                  Quote #{quote.id.slice(0, 8)}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                  Created: {new Date(quote.created_at).toLocaleDateString()}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-800">
                                                  ${quote.total_price.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-gray-600">Total Price</div>
                                              </div>
                                            </div>

                                            {quote.materials && (
                                              <div className="mb-3 pb-3 border-b border-gray-200">
                                                <p className="text-sm text-gray-600 mb-1">Material</p>
                                                <p className="text-gray-800 font-medium">
                                                  {quote.materials.name} ({quote.materials.brand})
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                  ${quote.materials.price_per_sqft}/sq ft
                                                </p>
                                              </div>
                                            )}

                                            {quote.quote_items && quote.quote_items.length > 0 && (
                                              <div>
                                                <p className="text-sm font-semibold text-gray-800 mb-2">
                                                  Quote Items ({quote.quote_items.length})
                                                </p>
                                                <div className="space-y-4">
                                                  {quote.quote_items.map((item: any, idx: number) => (
                                                    <div
                                                      key={item.id}
                                                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                                    >
                                                      <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                          <p className="font-semibold text-gray-800">
                                                            {item.layouts?.name || 'Unknown Layout'}
                                                          </p>
                                                          {item.environment && (
                                                            <p className="text-xs text-gray-500 capitalize mt-1">
                                                              {item.environment}
                                                            </p>
                                                          )}
                                                        </div>
                                                        <div className="text-right">
                                                          <p className="font-bold text-lg text-gray-800">
                                                            ${item.subtotal.toFixed(2)}
                                                          </p>
                                                          <p className="text-xs text-gray-500">Subtotal</p>
                                                        </div>
                                                      </div>

                                                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                                        <div>
                                                          <p className="text-gray-600">Dimensions</p>
                                                          <p className="text-gray-800 font-medium">
                                                            {item.width_ft.toFixed(2)} ft × {item.length_ft.toFixed(2)} ft
                                                          </p>
                                                        </div>
                                                        <div>
                                                          <p className="text-gray-600">Area</p>
                                                          <p className="text-gray-800 font-medium">
                                                            {item.area_sqft?.toFixed(3) || 'N/A'} sq ft
                                                          </p>
                                                        </div>
                                                      </div>

                                                      {item.material_cost !== null && item.material_cost !== undefined && (
                                                        <div className="mb-2 pb-2 border-b border-gray-200">
                                                          <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Material Cost</span>
                                                            <span className="text-gray-800 font-medium">
                                                              ${item.material_cost.toFixed(2)}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      )}

                                                      {item.edge_cost !== null && item.edge_cost !== undefined && (
                                                        <div className="mb-2 pb-2 border-b border-gray-200">
                                                          <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">
                                                              Edge ({item.edge_styles?.name || 'N/A'})
                                                              {item.edge_linear_ft && (
                                                                <span className="text-gray-500 ml-1">
                                                                  ({item.edge_linear_ft.toFixed(2)} ft)
                                                                </span>
                                                              )}
                                                            </span>
                                                            <span className="text-gray-800 font-medium">
                                                              ${item.edge_cost.toFixed(2)}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      )}

                                                      {item.cutout_cost !== null && item.cutout_cost !== undefined && item.cutout_cost > 0 && (
                                                        <div className="mb-2 pb-2 border-b border-gray-200">
                                                          <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600 font-medium">Cutouts</span>
                                                            <span className="text-gray-800 font-medium">
                                                              ${item.cutout_cost.toFixed(2)}
                                                            </span>
                                                          </div>
                                                          {item.cutouts && typeof item.cutouts === 'object' && (
                                                            <div className="ml-2 space-y-1">
                                                              {Object.entries(item.cutouts).map(([cutoutId, cutoutData]: [string, any]) => (
                                                                <div key={cutoutId} className="flex justify-between text-xs text-gray-600">
                                                                  <span>
                                                                    {cutoutData.name || cutoutId} (×{cutoutData.quantity})
                                                                  </span>
                                                                  <span>${cutoutData.total.toFixed(2)}</span>
                                                                </div>
                                                              ))}
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}

                                                      {item.sink_cost !== null && item.sink_cost !== undefined && item.sink_cost > 0 && (
                                                        <div className="mb-2 pb-2 border-b border-gray-200">
                                                          <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600 font-medium">Sinks</span>
                                                            <span className="text-gray-800 font-medium">
                                                              ${item.sink_cost.toFixed(2)}
                                                            </span>
                                                          </div>
                                                          {item.sinks && typeof item.sinks === 'object' && (
                                                            <div className="ml-2 space-y-1">
                                                              {Object.entries(item.sinks).map(([sinkId, sinkData]: [string, any]) => (
                                                                <div key={sinkId} className="flex justify-between text-xs text-gray-600">
                                                                  <span>
                                                                    {sinkData.name || sinkId} (×{sinkData.quantity})
                                                                  </span>
                                                                  <span>${sinkData.total.toFixed(2)}</span>
                                                                </div>
                                                              ))}
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}

                                                      {item.has_backsplash && (
                                                        <div className="mb-2 text-sm">
                                                          <span className="text-gray-600">Backsplash: </span>
                                                          <span className="text-gray-800 font-medium">Yes</span>
                                                          {item.backsplash_height && (
                                                            <span className="text-gray-600 ml-2">
                                                              ({item.backsplash_height} in)
                                                            </span>
                                                          )}
                                                        </div>
                                                      )}

                                                      {item.measurements && typeof item.measurements === 'object' && (
                                                        <details className="mt-2">
                                                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                                            View Measurements
                                                          </summary>
                                                          <div className="mt-2 p-2 bg-white rounded text-xs">
                                                            <div className="grid grid-cols-2 gap-2">
                                                              {Object.entries(item.measurements).map(([key, value]: [string, any]) => (
                                                                <div key={key} className="flex justify-between">
                                                                  <span className="text-gray-600 capitalize">{key}:</span>
                                                                  <span className="text-gray-800">{value} in</span>
                                                                </div>
                                                              ))}
                                                            </div>
                                                          </div>
                                                        </details>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
    </AdminShell>
  );
}


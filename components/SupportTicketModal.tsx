'use client';

import { useState } from 'react';
import { analyticsClient } from '../lib/analyticsClient';
import { SupportTicket } from '../lib/types';

interface SupportTicketModalProps {
  onClose: () => void;
  contextType: 'analytics' | 'playout' | 'channel' | 'content';
  contextId?: string;
}

export default function SupportTicketModal({
  onClose,
  contextType,
  contextId = '',
}: SupportTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    category: 'analytics' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority'],
    subject: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ticket: SupportTicket = {
        requesterId: 'current_user_id', // Replace with actual user ID from auth
        requesterRole: 'creator', // Replace with actual role
        tenantId: 'current_tenant_id', // Replace with actual tenant ID
        contextType,
        contextId,
        ...formData,
        status: 'open',
      };

      await analyticsClient.createSupportTicket(ticket);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      alert('Failed to create support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-700/30 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Create Support Ticket</h2>
              <p className="text-blue-300 text-sm mt-1">
                Get help from our engineering team
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">Ticket Created!</h3>
            <p className="text-blue-300">
              Our team will respond within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category */}
            <div>
              <label className="text-sm text-blue-300 mb-2 block">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="analytics">Analytics</option>
                <option value="playout">Playout</option>
                <option value="ai">AI Services</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm text-blue-300 mb-2 block">Priority *</label>
              <select
                required
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm text-blue-300 mb-2 block">Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-blue-300 mb-2 block">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description of the issue, steps to reproduce, etc."
                rows={6}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none placeholder-slate-400 resize-none"
              />
            </div>

            {/* Context Info */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <div className="text-sm text-blue-300 mb-2">Context Information:</div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Context Type: {contextType}</div>
                {contextId && <div>Context ID: {contextId}</div>}
                <div>Current Page: Analytics Dashboard</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

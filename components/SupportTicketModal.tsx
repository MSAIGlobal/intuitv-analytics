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
      <div className="bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(246,246,241,0.2)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#C6F833]">Create Support Ticket</h2>
              <p className="text-[rgba(246,246,241,0.7)] text-sm mt-1">
                Get help from our engineering team
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#C6F833] text-[#0A0A0A] hover:bg-[#D8FF5E] transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="font-display text-2xl font-bold text-[#C6F833] mb-2">Ticket Created!</h3>
            <p className="text-[rgba(246,246,241,0.7)]">
              Our team will respond within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category */}
            <div>
              <label className="text-sm text-[rgba(246,246,241,0.7)] mb-2 block">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                className="w-full px-4 py-3 bg-[rgba(198,248,51,0.12)] text-[#F6F6F1] rounded-lg border-2 border-[rgba(246,246,241,0.2)] focus:border-[#C6F833] focus:outline-none"
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
              <label className="text-sm text-[rgba(246,246,241,0.7)] mb-2 block">Priority *</label>
              <select
                required
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-4 py-3 bg-[rgba(198,248,51,0.12)] text-[#F6F6F1] rounded-lg border-2 border-[rgba(246,246,241,0.2)] focus:border-[#C6F833] focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm text-[rgba(246,246,241,0.7)] mb-2 block">Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 bg-[rgba(198,248,51,0.12)] text-[#F6F6F1] rounded-lg border-2 border-[rgba(246,246,241,0.2)] focus:border-[#C6F833] focus:outline-none placeholder-[rgba(246,246,241,0.5)]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-[rgba(246,246,241,0.7)] mb-2 block">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description of the issue, steps to reproduce, etc."
                rows={6}
                className="w-full px-4 py-3 bg-[rgba(198,248,51,0.12)] text-[#F6F6F1] rounded-lg border-2 border-[rgba(246,246,241,0.2)] focus:border-[#C6F833] focus:outline-none placeholder-[rgba(246,246,241,0.5)] resize-none"
              />
            </div>

            {/* Context Info */}
            <div className="bg-[rgba(198,248,51,0.12)] border-2 border-[rgba(246,246,241,0.2)] rounded-lg p-4">
              <div className="text-sm text-[#C6F833] mb-2">Context Information:</div>
              <div className="text-xs text-[rgba(246,246,241,0.7)] space-y-1">
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
                className="flex-1 px-6 py-3 bg-[#C6F833] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-lg hover:bg-[#D8FF5E] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#0A0A0A] text-[#C6F833] border-2 border-[#C6F833] rounded-lg hover:bg-[rgba(198,248,51,0.12)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

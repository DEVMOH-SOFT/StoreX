/**
 * StoreX Integration Helper for ThirdEye Continuous Trust Layer.
 * Pre-configured project key: te_proj_storex_99a8b7c6
 * ThirdEye API Gateway: http://localhost:4000 (or process.env.THIRDEYE_API_URL)
 */

export const THIRDEYE_CONFIG = {
  projectKey: process.env.THIRDEYE_PROJECT_KEY || 'te_proj_storex_99a8b7c6',
  gatewayUrl: process.env.THIRDEYE_API_URL || 'http://localhost:4000',
  integrations: {
    stripe: 'stripe_pay',
    salesAgent: 'storex_sales_agent_skill',
    supportAgent: 'support_agent_tool',
    segment: 'segment_analytics',
    fedex: 'fedex_delivery',
    klaviyo: 'klaviyo_marketing',
  },
};

export interface ThirdEyeCheckResult {
  action: 'ALLOW' | 'MONITOR' | 'RATE_LIMIT' | 'BLOCK' | 'QUARANTINE';
  riskScore: number;
  reason?: string;
  violations?: Array<{ type: string; detail: string }>;
  offline?: boolean;
}

/**
 * Verify third-party API or AI Agent tool execution against ThirdEye Trust Engine.
 */
export async function checkThirdEyeTrust(
  integrationId: string,
  endpoint: string,
  dataRequested: string[] = [],
  method = 'POST'
): Promise<ThirdEyeCheckResult> {
  try {
    const res = await fetch(`${THIRDEYE_CONFIG.gatewayUrl}/api/check-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${THIRDEYE_CONFIG.projectKey}`,
      },
      body: JSON.stringify({
        integrationId,
        endpoint,
        method,
        dataRequested,
      }),
    });

    if (!res.ok) {
      return { action: 'ALLOW', riskScore: 5, offline: true };
    }

    return await res.json();
  } catch {
    // Fail-open for StoreX store resilience when ThirdEye engine is offline
    return { action: 'ALLOW', riskScore: 5, offline: true };
  }
}

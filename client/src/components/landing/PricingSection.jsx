import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Check, ArrowRight } from 'lucide-react';

export const PricingSection = () => {
  const { token } = useAuth();

  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      description: 'Ideal for small dev sandboxes and cost evaluation.',
      features: [
        '1 connected cloud account',
        '7-day cost forecasting',
        'Standard billing reports',
        'Email alerts (2 per month)',
      ],
      isPopular: false,
      buttonText: 'Start for Free',
      color: 'border-white/5 bg-white/[0.02]',
    },
    {
      name: 'Pro Plan',
      price: '$79',
      period: 'per month',
      description: 'Built for active DevOps teams and FinOps analysts.',
      features: [
        '3 connected cloud accounts',
        '90-day Cost Prediction Grid',
        'Advanced XGBoost models',
        'Unlimited Slack / MS Teams webhooks',
        'Daily database sync logs',
      ],
      isPopular: true,
      buttonText: 'Go Pro Now',
      color: 'border-primary/30 bg-primary/[0.03] shadow-lg shadow-primary/5',
    },
    {
      name: 'Enterprise Plan',
      price: 'Custom',
      period: 'contact sales',
      description: 'Enterprise grade custom machine learning & alerts.',
      features: [
        'Unlimited cloud accounts',
        'Custom TensorFlow training',
        'Dedicated FinOps support SLA',
        'Raw data BigQuery/S3 exports',
        'Role-Based IAM permissions (RBAC)',
      ],
      isPopular: false,
      buttonText: 'Contact Enterprise',
      color: 'border-white/5 bg-white/[0.02]',
    },
  ];

  return (
    <section id="pricing" className="relative py-24 bg-navy-dark overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Pricing Model</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Flexible Plans for Any Scale
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed">
            Select the plan that fits your cloud architecture complexity.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`glass-card p-6 sm:p-8 rounded-2xl border ${plan.color} relative overflow-hidden flex flex-col justify-between hover:border-white/15 transition-all duration-300`}
            >
              {plan.isPopular && (
                <span className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5 my-4">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-gray-500 font-semibold lowercase">/ {plan.period}</span>
                </div>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">{plan.description}</p>
                
                <hr className="border-white/5 my-6" />

                <ul className="space-y-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  to={token ? '/dashboard' : '/login'}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition-all cursor-pointer ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-primary to-orange-600 text-white hover:opacity-95 shadow-lg shadow-primary/20'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
export default PricingSection;

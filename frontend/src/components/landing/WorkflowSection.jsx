import React from 'react';
import { 
  Database, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  BrainCircuit, 
  Globe, 
  TrendingUp, 
  LayoutDashboard, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const WorkflowSection = () => {
  const steps = [
    {
      icon: Database,
      title: "1. Crime Data Ingestion",
      desc: "Structured feeds from police records, FIRs, & historical logs",
      tag: "Raw Inputs"
    },
    {
      icon: CheckCircle2,
      title: "2. Data Validation",
      desc: "Duplicate removal, missing value handling & spatial verification",
      tag: "Data Clean"
    },
    {
      icon: Cpu,
      title: "3. Data Processing",
      desc: "Feature extraction, time-series binning & coordinate normalization",
      tag: "ETL Pipeline"
    },
    {
      icon: Layers,
      title: "4. Spatial Database",
      desc: "PostgreSQL & PostGIS optimized spatial indexing engine",
      tag: "Storage"
    },
    {
      icon: BrainCircuit,
      title: "5. AI/ML Analysis",
      desc: "Machine learning models trained on temporal & geographical patterns",
      tag: "Scikit-Learn / XGBoost"
    },
    {
      icon: Globe,
      title: "6. Geospatial Analysis",
      desc: "KDE Hotspot estimation, spatial clustering & buffer analysis",
      tag: "GIS Processing"
    },
    {
      icon: TrendingUp,
      title: "7. Crime Risk Prediction",
      desc: "Generating predictive risk indices & temporal vulnerability scores",
      tag: "Predictive Output"
    },
    {
      icon: LayoutDashboard,
      title: "8. Interactive Dashboard",
      desc: "Role-tailored interfaces for Admins, Officers, and Citizens",
      tag: "RBAC Portal"
    },
    {
      icon: ShieldCheck,
      title: "9. Actionable Intelligence",
      desc: "Optimized patrol routing, resource allocation & public safety advisories",
      tag: "Decision Support"
    }
  ];

  return (
    <section id="how-it-works" className="workflow-section">
      <div className="section-header">
        <div className="section-pill">INTELLIGENCE PIPELINE</div>
        <h2 className="section-title">How CrimeVista Operates</h2>
        <p className="section-subtitle">
          An end-to-end multi-tiered workflow transforming raw incident reports into actionable law enforcement strategies.
        </p>
      </div>

      <div className="workflow-grid">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <div key={idx} className="workflow-card">
              <div className="card-top-row">
                <div className="step-badge">{step.tag}</div>
                <div className="step-icon-wrap">
                  <IconComp size={22} className="step-icon" />
                </div>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              
              {idx < steps.length - 1 && (
                <div className="flow-arrow-container">
                  <ArrowRight size={16} className="flow-arrow" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

"use client";

import type { PricingPlanFormData } from "./AdminPricingForm";

interface PricingFeeFieldsProps {
  formData: PricingPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PricingPlanFormData>>;
}

export function PricingFeeFields({ formData, setFormData }: PricingFeeFieldsProps) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <>
      <div>
        <label htmlFor="plan-reg-fee" className="block text-xs font-medium text-foreground">
          Registration Fee (₹ INR)
        </label>
        <input
          id="plan-reg-fee"
          type="number"
          min={0}
          required
          value={formData.registrationFeeInr}
          onChange={(e) =>
            setFormData((p) => ({ ...p, registrationFeeInr: parseInt(e.target.value, 10) || 0 }))
          }
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="plan-male-comm" className="block text-xs font-medium text-foreground">
          Male Commission (₹ INR)
        </label>
        <input
          id="plan-male-comm"
          type="number"
          min={0}
          required
          value={formData.maleCommissionInr}
          onChange={(e) =>
            setFormData((p) => ({ ...p, maleCommissionInr: parseInt(e.target.value, 10) || 0 }))
          }
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="plan-fem-comm" className="block text-xs font-medium text-foreground">
          Female Commission (₹ INR)
        </label>
        <input
          id="plan-fem-comm"
          type="number"
          min={0}
          required
          value={formData.femaleCommissionInr}
          onChange={(e) =>
            setFormData((p) => ({ ...p, femaleCommissionInr: parseInt(e.target.value, 10) || 0 }))
          }
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="plan-validity" className="block text-xs font-medium text-foreground">
          Validity (Months)
        </label>
        <input
          id="plan-validity"
          type="number"
          min={1}
          required
          value={formData.validityMonths}
          onChange={(e) =>
            setFormData((p) => ({ ...p, validityMonths: parseInt(e.target.value, 10) || 11 }))
          }
          className={inputClass}
        />
      </div>
    </>
  );
}

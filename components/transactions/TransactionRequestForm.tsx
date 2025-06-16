import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Database } from "@/types/database.types";
import { TransactionRequestFormProps } from "./types";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type TransactionFormData = Database['public']['Tables']['transactions']['Row'];

interface TransactionRequestFormProps {
  sellerId: string;
}

const TransactionRequestForm: React.FC<TransactionRequestFormProps> = ({ sellerId }: TransactionRequestFormProps) => {
  const CATEGORIES = ["Electronics", "Fashion", "Services", "Collectibles", "Other"];
  const DELIVERY_METHODS = ["Shipping", "Local Pickup", "Digital Delivery"];
  const CURRENCIES = ["USD", "EUR", "GBP", "NGN"];

  const [form, setForm] = useState<TransactionFormData>({
    id: '',
    seller_id: sellerId,
    item_title: '',
    category: '',
    description: '',
    photos: [],
    price: '',
    currency: 'USD',
    price_justification: '',
    delivery_method: '',
    shipping_details: '',
    inspection_period: 7,
    payment_deadline: '',
    return_policy: '',
    warranty: '',
    special_terms: '',
    buyer_email: '',
    buyer_name: '',
    buyer_phone: '',
    require_verification: false,
    min_buyer_rating: 0,
    allow_direct_comm: false,
    comm_guidelines: '',
    fee_payer: '',
    insurance: '',
    dispute_resolution: '',
    protection_services: '',
    status: 'pending',
    draft: false,
    created_at: '',
    updated_at: ''
  });

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [annotateIdx, setAnnotateIdx] = useState<number | null>(null);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!form.draft) return;
    const interval = setInterval(() => saveDraft(), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [form]);

  const saveDraft = async () => {
    setSaving(true);
    await supabase.from("transactions").upsert({
      ...form,
      seller_id: sellerId,
      status: "pending",
      draft: true
    });
    setDraftSaved(true);
    setSaving(false);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: TransactionFormData) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const uploaded: string[] = [];
    for (const file of files) {
      const path = `transactions/${sellerId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("attachments").upload(path, file);
      if (uploadError) continue;
      const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(path);
      if (urlData?.publicUrl) uploaded.push(urlData.publicUrl);
    }
    setForm((prev: TransactionFormData) => ({
      ...prev,
      photos: [...(prev?.photos || []), ...uploaded]
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!form.item_title.trim()) errors.push("Item title is required");
    if (!form.category) errors.push("Category is required");
    if (!form.description.trim()) errors.push("Description is required");
    if (!form.photos.length) errors.push("At least one photo is required");
    if (!form.price.trim()) errors.push("Price is required");
    if (!form.currency) errors.push("Currency is required");
    if (!form.delivery_method) errors.push("Delivery method is required");
    if (!form.shipping_details.trim()) errors.push("Shipping details are required");
    if (!form.inspection_period) errors.push("Inspection period is required");
    if (!form.payment_deadline) errors.push("Payment deadline is required");
    if (!form.return_policy.trim()) errors.push("Return policy is required");
    if (!form.warranty.trim()) errors.push("Warranty information is required");
    if (!form.buyer_email.trim()) errors.push("Buyer email is required");
    if (!form.buyer_name.trim()) errors.push("Buyer name is required");
    if (!form.buyer_phone.trim()) errors.push("Buyer phone is required");
    if (!form.require_verification) errors.push("Verification requirement is required");
    if (!form.min_buyer_rating) errors.push("Minimum buyer rating is required");
    if (!form.allow_direct_comm) errors.push("Communication preference is required");
    if (!form.fee_payer) errors.push("Fee structure is required");
    if (!form.insurance.trim()) errors.push("Insurance coverage is required");
    if (!form.dispute_resolution.trim()) errors.push("Dispute resolution is required");
    if (!form.protection_services.trim()) errors.push("Protection services are required");

    if (!form.buyer_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.buyer_email)) errors.push("Valid buyer email required");
    if (!form.currency) errors.push("Currency is required");

    return errors;
  };

  const handleAnnotationSave = async (dataUrl: string) => {
    if (annotateIdx === null) return;
    setForm((prev: TransactionFormData) => ({
      ...prev,
      photos: prev?.photos?.map((photo: string, i: number) => i === annotateIdx ? dataUrl : photo) || []
    }));
    setAnnotateIdx(null);
  };

  const handleSubmit = async (sendInvitation = true, e?: FormEvent<HTMLFormElement>) => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert("Please fix the following errors:\n" + validationErrors.join("\n"));
      return;
    }
    setSaving(true);
    try {
      const { data: insertData, error: insertError } = await supabase.from("transactions").insert({
        ...form,
        seller_id: sellerId,
        status: "pending",
        draft: !sendInvitation
      });
      if (insertError) throw insertError;
      
      if (sendInvitation && insertData?.[0]?.id) {
        await Promise.all([
          fetch("/api/notify", {
            method: "POST",
            body: JSON.stringify({
              user_id: form.buyer_email,
              transaction_id: insertData[0].id,
              type: "email",
              message: `You have been invited to a transaction: ${form.item_title}`
            }),
            headers: { "Content-Type": "application/json" }
          }),
          fetch("/api/notify", {
            method: "POST",
            body: JSON.stringify({
              user_id: form.buyer_phone,
              transaction_id: insertData[0].id,
              type: "sms",
              message: `You have been invited to a transaction: ${form.item_title}`
            }),
            headers: { "Content-Type": "application/json" }
          }),
          fetch("/api/notify", {
            method: "POST",
            body: JSON.stringify({
              user_id: form.buyer_email,
              transaction_id: insertData[0].id,
              type: "in-app",
              message: `You have been invited to a transaction: ${form.item_title}`
            }),
            headers: { "Content-Type": "application/json" }
          })
        ]);
      }
      setSaving(false);
      alert("Transaction created successfully!");
    } catch (err) {
      console.error("Error creating transaction:", err);
      setSaving(false);
      alert("Failed to create transaction. Please try again.");
    }
        status: "pending",
        draft: !sendInvitation
      });
      if (error) throw error;
      
      if (sendInvitation && data?.[0]?.id) {
        await Promise.all([
          fetch("/api/notify", {
            method: "POST",
            body: JSON.stringify({
              user_id: form.buyer_email,
              transaction_id: data[0].id,
              type: "email",
              message: `You have been invited to a transaction: ${form.item_title}`
            }),
            headers: { "Content-Type": "application/json" }
          }),
          fetch("/api/notify", {
            method: "POST",
            body: JSON.stringify({
              user_id: form.buyer_phone,
              transaction_id: data[0].id,
              type: "sms",
              message: `You have been invited to a transaction: ${form.item_title}`
            }),
            headers: { "Content-Type": "application/json" }
          }),
          fetch("/api/notify", {
            method: "POST",
            body: JSON.stringify({
              user_id: form.buyer_email,
              transaction_id: data[0].id,
              type: "in-app",
              message: `You have been invited to a transaction: ${form.item_title}`
            }),
            headers: { "Content-Type": "application/json" }
          })
        ]);
      }
        body: JSON.stringify({
          user_id: form.buyer_email,
          transaction_id: data[0]?.id,
          type: "email",
          message: `You have been invited to a transaction: ${form.item_title}`
        }),
        headers: { "Content-Type": "application/json" }
      });
      // SMS notification (example)
      await fetch("/api/notify", {
        method: "POST",
        body: JSON.stringify({
          user_id: form.buyer_phone,
          transaction_id: data[0]?.id,
          type: "sms",
          message: `You have been invited to a transaction: ${form.item_title}`
        }),
        headers: { "Content-Type": "application/json" }
      });
      // In-app notification (example)
      await fetch("/api/notify", {
        method: "POST",
        body: JSON.stringify({
          user_id: form.buyer_email,
          transaction_id: data[0]?.id,
          type: "in-app",
          message: `You have been invited to a transaction: ${form.item_title}`
        }),
        headers: { "Content-Type": "application/json" }
      });
    }
    // Redirect or show confirmation
  };

  // Render Steps
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Escrow Transaction</CardTitle>
        <CardDescription>Step {step} of 5</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold">Create Escrow Transaction</h2>
          <div className="text-sm text-gray-500">Step {step} of 5</div>
        </div>
        {step === 1 && (
          <>
            <Input label="Item Title" name="item_title" value={form.item_title} onChange={handleChange} required />
            <label className="block mt-4">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border mt-1 rounded p-2"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the item/service, condition, features, defects..."
            />
            <label className="block mt-4">Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="mb-2"
            />
            <div className="flex gap-2 flex-wrap">
              {form.photos.map((url: string, idx: number) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt="uploaded"
                    className="w-16 h-16 object-cover rounded border cursor-pointer"
                    onClick={() => setAnnotateIdx(idx)}
                  />
                  {annotateIdx === idx && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
                      <div className="bg-white p-4 rounded shadow-lg">
                        <ImageAnnotator
                          imageUrl={url}
                          onSave={(dataUrl: string) => handleAnnotationSave(idx, dataUrl)}
                        />
                        <button
                          className="mt-2 px-4 py-2 bg-gray-400 text-white rounded"
                          onClick={() => setAnnotateIdx(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="block">Delivery Method</label>
            <select
              name="delivery_method"
              value={form.delivery_method}
              onChange={handleChange}
              className="w-full border mt-1 rounded p-2"
            >
              <option value="">Select Method</option>
              {DELIVERY_METHODS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <Input
              label="Shipping Details"
              name="shipping_details"
              value={form.shipping_details}
              onChange={handleChange}
            />
            <Input
              label="Expected Shipping Timeframe"
              name="expected_shipping_timeframe"
              value={form.expected_shipping_timeframe}
              onChange={handleChange}
            />
            <Input
              label="Buyer Inspection Period (days)"
              name="inspection_period"
              value={form.inspection_period}
              onChange={handleChange}
              type="number"
              min={3}
              max={14}
            />
            <Input
              label="Payment Deadline"
              name="payment_deadline"
              value={form.payment_deadline}
              onChange={handleChange}
              type="date"
            />
            <Textarea
              label="Return Policy"
              name="return_policy"
              value={form.return_policy}
              onChange={handleChange}
            />
            <Textarea
              label="Warranty Info"
              name="warranty"
              value={form.warranty}
              onChange={handleChange}
            />
            <Textarea
              label="Special Handling Instructions"
              name="special_terms"
              value={form.special_terms}
              onChange={handleChange}
            />
          </>
        )}
        {step === 3 && (
          <>
            <Input
              label="Buyer Email"
              name="buyer_email"
              value={form.buyer_email}
              onChange={handleChange}
              required
            />
            <Input
              label="Buyer Name"
              name="buyer_name"
              value={form.buyer_name}
              onChange={handleChange}
            />
            <Input
              label="Buyer Phone"
              name="buyer_phone"
              value={form.buyer_phone}
              onChange={handleChange}
            />
            <label className="block mt-4">Require Buyer ID Verification</label>
            <input
              type="checkbox"
              name="require_verification"
              checked={form.require_verification}
              onChange={handleChange}
            />
            <Input
              label="Minimum Buyer Rating"
              name="min_buyer_rating"
              value={form.min_buyer_rating}
              onChange={handleChange}
              type="number"
              min={0}
              max={5}
            />
            <label className="block mt-4">Allow Direct Communication</label>
            <input
              type="checkbox"
              name="allow_direct_comm"
              checked={form.allow_direct_comm}
              onChange={handleChange}
            />
            <Textarea
              label="Communication Guidelines"
              name="comm_guidelines"
              value={form.comm_guidelines}
              onChange={handleChange}
            />
          </>
        )}
        {step === 4 && (
          <>
            <label className="block">Fee Structure</label>
            <select
              name="fee_payer"
              value={form.fee_payer}
              onChange={handleChange}
              className="w-full border mt-1 rounded p-2"
            >
              <option value="split">Split</option>
              <option value="buyer">Buyer Pays</option>
              <option value="seller">Seller Pays</option>
            </select>
            <Textarea
              label="Insurance Coverage"
              name="insurance"
              value={form.insurance}
              onChange={handleChange}
            />
            <Textarea
              label="Dispute Resolution Preferences"
              name="dispute_resolution"
              value={form.dispute_resolution}
              onChange={handleChange}
            />
            <Textarea
              label="Special Protection Services"
              name="protection_services"
              value={form.protection_services}
              onChange={handleChange}
            />
          </>
        )}
        {step === 5 && (
          <>
            <div className="bg-gray-50 border rounded p-4 mb-4">
              <h4 className="font-semibold mb-2">Review Transaction</h4>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(form, null, 2)}
              </pre>
            </div>
            <label className="block mt-2">
              I agree to the escrow service agreement and seller responsibilities
            </label>
            <input type="checkbox" required />
          </>
        )}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < 5 && (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          )}
          {step === 5 && (
            <>
              <Button onClick={() => handleSubmit(true)} disabled={saving}>
                Send Transaction Request
              </Button>
              <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={saving}>
                Save as Draft
              </Button>
            </>
          )}
        </div>
        {draftSaved && (
          <div className="text-green-600 mt-2">Draft saved!</div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionRequestForm;

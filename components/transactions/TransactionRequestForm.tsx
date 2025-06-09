import React, { useState, useEffect } from "react";
import { supabase } from "../../src/supabaseClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const CATEGORIES = ["Electronics", "Fashion", "Services", "Collectibles", "Other"];
const DELIVERY_METHODS = ["Shipping", "Local Pickup", "Digital Delivery"];
const CURRENCIES = ["USD", "EUR", "GBP", "NGN"];

const defaultState = {
  item_title: "",
  category: "",
  description: "",
  photos: [],
  price: "",
  currency: "USD",
  price_justification: "",
  delivery_method: "",
  shipping_details: "",
  inspection_period: 7,
  payment_deadline: "",
  return_policy: "",
  warranty: "",
  special_terms: "",
  buyer_email: "",
  buyer_name: "",
  buyer_phone: "",
  require_verification: false,
  min_buyer_rating: 0,
  allow_direct_comm: true,
  comm_guidelines: "",
  fee_payer: "split",
  insurance: "",
  dispute_resolution: "",
  protection_services: "",
  draft: false
};

import ImageAnnotator from "./ImageAnnotator";

const TransactionRequestForm = ({ sellerId }) => {
  const [step, setStep] = useState(1);
const [form, setForm] = useState(defaultState);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];
    for (let file of files) {
      const path = `transactions/${sellerId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from("attachments").upload(path, file);
      if (!error) {
        const url = supabase.storage.from("attachments").getPublicUrl(path).data.publicUrl;
        uploaded.push(url);
      }
    }
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }));
  };

  const validateForm = () => {
  const errors: string[] = [];
  if (!form.item_title) errors.push("Item title is required");
  if (!form.category) errors.push("Category is required");
  if (!form.description) errors.push("Description is required");
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errors.push("Valid price is required");
  if (!form.buyer_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.buyer_email)) errors.push("Valid buyer email required");
  if (!form.currency) errors.push("Currency is required");
  // Add more as needed
  return errors;
};

const handleAnnotationSave = (idx: number, dataUrl: string) => {
  setForm((prev) => {
    const photos = [...prev.photos];
    photos[idx] = dataUrl;
    return { ...prev, photos };
  });
  setAnnotateIdx(null);
};

const handleSubmit = async (sendInvitation = true) => {
    const errors = validateForm();
if (errors.length > 0) {
  alert("Please fix the following errors:\n" + errors.join("\n"));
  return;
}
setSaving(true);
const { data, error } = await supabase.from("transactions").insert({
  ...form,
  seller_id: sellerId,
  status: "pending",
  draft: !sendInvitation
});
setSaving(false);
if (!error && sendInvitation) {
  // Call edge function to send invitation/notification
  await fetch("/api/notify", {
    method: "POST",
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
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-bold">Create Escrow Transaction</h2>
        <div className="text-sm text-gray-500">Step {step} of 5</div>
      </div>
      {step === 1 && (
        <>
          <Input label="Item Title" name="item_title" value={form.item_title} onChange={handleChange} required />
          <label className="block mt-4">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="w-full border mt-1 rounded p-2">
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the item/service, condition, features, defects..." />
          <label className="block mt-4">Photos</label>
<input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="mb-2" />
<div className="flex gap-2 flex-wrap">
  {form.photos.map((url, idx) => (
    <div key={idx} className="relative group">
      <img src={url} alt="uploaded" className="w-16 h-16 object-cover rounded border cursor-pointer" onClick={() => setAnnotateIdx(idx)} />
      {annotateIdx === idx && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <ImageAnnotator imageUrl={url} onSave={(dataUrl) => handleAnnotationSave(idx, dataUrl)} />
            <button className="mt-2 px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setAnnotateIdx(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  ))}
</div>
          <Input label="Price" name="price" value={form.price} onChange={handleChange} type="number" required />
          <label className="block mt-4">Currency</label>
          <select name="currency" value={form.currency} onChange={handleChange} className="w-full border mt-1 rounded p-2">
            {CURRENCIES.map((cur) => <option key={cur} value={cur}>{cur}</option>)}
          </select>
          <Textarea label="Price Justification (optional)" name="price_justification" value={form.price_justification} onChange={handleChange} rows={2} />
        </>
      )}
      {step === 2 && (
        <>
          <label className="block">Delivery Method</label>
          <select name="delivery_method" value={form.delivery_method} onChange={handleChange} className="w-full border mt-1 rounded p-2">
            <option value="">Select Method</option>
            {DELIVERY_METHODS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <Input label="Shipping Details" name="shipping_details" value={form.shipping_details} onChange={handleChange} />
          <Input label="Expected Shipping Timeframe" name="expected_shipping_timeframe" value={form.expected_shipping_timeframe} onChange={handleChange} />
          <Input label="Buyer Inspection Period (days)" name="inspection_period" value={form.inspection_period} onChange={handleChange} type="number" min={3} max={14} />
          <Input label="Payment Deadline" name="payment_deadline" value={form.payment_deadline} onChange={handleChange} type="date" />
          <Textarea label="Return Policy" name="return_policy" value={form.return_policy} onChange={handleChange} />
          <Textarea label="Warranty Info" name="warranty" value={form.warranty} onChange={handleChange} />
          <Textarea label="Special Handling Instructions" name="special_terms" value={form.special_terms} onChange={handleChange} />
        </>
      )}
      {step === 3 && (
        <>
          <Input label="Buyer Email" name="buyer_email" value={form.buyer_email} onChange={handleChange} required />
          <Input label="Buyer Name" name="buyer_name" value={form.buyer_name} onChange={handleChange} />
          <Input label="Buyer Phone" name="buyer_phone" value={form.buyer_phone} onChange={handleChange} />
          <label className="block mt-4">Require Buyer ID Verification</label>
          <input type="checkbox" name="require_verification" checked={form.require_verification} onChange={handleChange} />
          <Input label="Minimum Buyer Rating" name="min_buyer_rating" value={form.min_buyer_rating} onChange={handleChange} type="number" min={0} max={5} />
          <label className="block mt-4">Allow Direct Communication</label>
          <input type="checkbox" name="allow_direct_comm" checked={form.allow_direct_comm} onChange={handleChange} />
          <Textarea label="Communication Guidelines" name="comm_guidelines" value={form.comm_guidelines} onChange={handleChange} />
        </>
      )}
      {step === 4 && (
        <>
          <label className="block">Fee Structure</label>
          <select name="fee_payer" value={form.fee_payer} onChange={handleChange} className="w-full border mt-1 rounded p-2">
            <option value="split">Split</option>
            <option value="buyer">Buyer Pays</option>
            <option value="seller">Seller Pays</option>
          </select>
          <Textarea label="Insurance Coverage" name="insurance" value={form.insurance} onChange={handleChange} />
          <Textarea label="Dispute Resolution Preferences" name="dispute_resolution" value={form.dispute_resolution} onChange={handleChange} />
          <Textarea label="Special Protection Services" name="protection_services" value={form.protection_services} onChange={handleChange} />
        </>
      )}
      {step === 5 && (
        <>
          <div className="bg-gray-50 border rounded p-4 mb-4">
            <h4 className="font-semibold mb-2">Review Transaction</h4>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(form, null, 2)}</pre>
          </div>
          <label className="block mt-2">I agree to the escrow service agreement and seller responsibilities</label>
          <input type="checkbox" required />
        </>
      )}
      <div className="flex justify-between mt-6">
        {step > 1 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>}
        {step < 5 && <Button onClick={() => setStep((s) => s + 1)}>Next</Button>}
        {step === 5 && (
          <>
            <Button onClick={() => handleSubmit(true)} disabled={saving}>Send Transaction Request</Button>
            <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={saving}>Save as Draft</Button>
          </>
        )}
      </div>
      {draftSaved && <div className="text-green-600 mt-2">Draft saved!</div>}
    </div>
  );
};

export default TransactionRequestForm;

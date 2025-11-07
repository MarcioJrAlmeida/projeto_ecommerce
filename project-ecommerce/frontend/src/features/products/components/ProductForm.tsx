import { useEffect, useMemo, useState } from 'react';
import type { ProductInput } from '../api';

export function ProductForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial: (ProductInput & { id?: number }) | null;
  onSubmit: (data: ProductInput) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState<number>(Number(initial?.price ?? 0));
  const [category, setCategory] = useState(initial?.category ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial?.name ?? '');
    setPrice(Number(initial?.price ?? 0));
    setCategory(initial?.category ?? '');
    setImageUrl(initial?.imageUrl ?? '');
    setDescription(initial?.description ?? '');
  }, [initial]);

  const valid = useMemo(() => name.trim() && Number.isFinite(price) && price >= 0, [name, price]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), price: Number(price), category: category || undefined, imageUrl: imageUrl || undefined, description: description || undefined });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <h3 style={{ margin: 0 }}>{title}</h3>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Nome*</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Preço*</span>
        <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Categoria</span>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex.: Vestuário" />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Imagem (URL)</span>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Descrição</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn" disabled={!valid || saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  );
}

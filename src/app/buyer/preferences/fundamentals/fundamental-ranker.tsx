"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Fundamental } from "@prisma/client";
import { saveFundamentalRanks } from "@/lib/actions/preferences";
import { FUNDAMENTAL_LABELS } from "@/lib/fundamentals";

function SortableRow({ id, rank }: { id: Fundamental; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-4 py-3 ${
        isDragging ? "opacity-50" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
        {rank}
      </span>
      <span className="text-sm font-medium text-zinc-900">{FUNDAMENTAL_LABELS[id]}</span>
      <span className="ml-auto text-zinc-300">⠿</span>
    </li>
  );
}

export function FundamentalRanker({ initialOrder }: { initialOrder: Fundamental[] }) {
  const [items, setItems] = useState(initialOrder);
  const [result, setResult] = useState<{ error?: string; success?: boolean }>({});
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.indexOf(active.id as Fundamental);
      const newIndex = current.indexOf(over.id as Fundamental);
      return arrayMove(current, oldIndex, newIndex);
    });
  }

  function handleSave() {
    setResult({});
    startTransition(async () => {
      const res = await saveFundamentalRanks(items);
      setResult(res);
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">Drag to rank from most important (top) to least important.</p>
      <DndContext
        id="fundamentals-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((id, index) => (
              <SortableRow key={id} id={id} rank={index + 1} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {result.error && <p className="text-sm text-red-600">{result.error}</p>}
      {result.success && <p className="text-sm text-green-700">Saved.</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save ranking"}
      </button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveMustHaves } from "@/lib/actions/preferences";

const MIN_MUST_HAVES = 5;
const MAX_MUST_HAVES = 10;

type ContainerId = "available" | "ranked";
type Feature = { id: string; label: string; category: string | null };

function findContainer(id: string, items: Record<ContainerId, string[]>): ContainerId | undefined {
  if (id === "available" || id === "ranked") return id;
  return (Object.keys(items) as ContainerId[]).find((key) => items[key].includes(id));
}

function FeatureRow({ feature, rank }: { feature: Feature; rank?: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 ${
        isDragging ? "opacity-50" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      {rank !== undefined && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
          {rank}
        </span>
      )}
      <div>
        <p className="text-sm font-medium text-zinc-900">{feature.label}</p>
        {feature.category && <p className="text-xs text-zinc-400">{feature.category}</p>}
      </div>
      <span className="ml-auto text-zinc-300">⠿</span>
    </li>
  );
}

function Column({
  id,
  title,
  subtitle,
  featureIds,
  featuresById,
  showRank,
}: {
  id: ContainerId;
  title: string;
  subtitle: string;
  featureIds: string[];
  featuresById: Map<string, Feature>;
  showRank: boolean;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <p className="mb-2 text-xs text-zinc-500">{subtitle}</p>
      <SortableContext items={featureIds} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="min-h-[120px] space-y-2 rounded-md bg-zinc-50 p-2">
          {featureIds.map((featureId, index) => {
            const feature = featuresById.get(featureId);
            if (!feature) return null;
            return <FeatureRow key={featureId} feature={feature} rank={showRank ? index + 1 : undefined} />;
          })}
        </ul>
      </SortableContext>
    </div>
  );
}

export function MustHaveRanker({
  allFeatures,
  initialRankedIds,
}: {
  allFeatures: Feature[];
  initialRankedIds: string[];
}) {
  const featuresById = new Map(allFeatures.map((f) => [f.id, f]));
  const [items, setItems] = useState<Record<ContainerId, string[]>>({
    ranked: initialRankedIds,
    available: allFeatures.map((f) => f.id).filter((id) => !initialRankedIds.includes(id)),
  });
  const [result, setResult] = useState<{ error?: string; success?: boolean }>({});
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string, items);
    const overContainer = findContainer(over.id as string, items);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setItems((current) => {
      const activeItems = current[activeContainer].filter((id) => id !== active.id);
      const overItems = current[overContainer];
      if (overContainer === "ranked" && overItems.length >= MAX_MUST_HAVES) {
        return current;
      }
      const overIndex = overItems.indexOf(over.id as string);
      const insertAt = overIndex >= 0 ? overIndex : overItems.length;
      return {
        ...current,
        [activeContainer]: activeItems,
        [overContainer]: [...overItems.slice(0, insertAt), active.id as string, ...overItems.slice(insertAt)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const container = findContainer(active.id as string, items);
    if (!container) return;
    const activeIndex = items[container].indexOf(active.id as string);
    const overIndex = items[container].indexOf(over.id as string);
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      setItems((current) => ({
        ...current,
        [container]: arrayMove(current[container], activeIndex, overIndex),
      }));
    }
  }

  function handleSave() {
    setResult({});
    if (items.ranked.length < MIN_MUST_HAVES) {
      setResult({ error: `Pick at least ${MIN_MUST_HAVES} must-haves` });
      return;
    }
    startTransition(async () => {
      const res = await saveMustHaves(items.ranked);
      setResult(res);
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Drag {MIN_MUST_HAVES}-{MAX_MUST_HAVES} features into your ranked list, most important at the top.
      </p>
      <DndContext
        id="must-haves-dnd"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Column
            id="available"
            title="Available features"
            subtitle="Drag features you care about to the right"
            featureIds={items.available}
            featuresById={featuresById}
            showRank={false}
          />
          <Column
            id="ranked"
            title={`Your must-haves (${items.ranked.length}/${MAX_MUST_HAVES})`}
            subtitle="Most important at the top"
            featureIds={items.ranked}
            featuresById={featuresById}
            showRank
          />
        </div>
      </DndContext>
      {result.error && <p className="text-sm text-red-600">{result.error}</p>}
      {result.success && <p className="text-sm text-green-700">Saved.</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save must-haves"}
      </button>
    </div>
  );
}

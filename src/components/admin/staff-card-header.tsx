"use client";

import { useState } from "react";
import { Check, Edit2, User, X } from "lucide-react";

import { toggleStaffAction, updateStaffAction } from "@/app/admin/actions";

export function StaffCardHeader({
  member,
}: {
  member: {
    id: string;
    name: string;
    color: string;
    isActive: boolean;
    services: { id: string; name: string }[];
  };
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [color, setColor] = useState(member.color);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5">
      {editing ? (
        <form action={updateStaffAction} className="flex-1 flex flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={member.id} />
          {member.services.map((s) => (
            <input key={s.id} type="hidden" name="serviceIds" value={s.id} />
          ))}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700">Nombre:</span>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700">Color:</span>
            <input
              name="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-7 w-12 cursor-pointer rounded border border-zinc-300 bg-white px-1 py-0.5"
            />
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex h-7 items-center rounded border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-7 items-center gap-1 rounded bg-zinc-900 px-3 text-xs font-semibold text-white hover:bg-zinc-800 cursor-pointer"
            >
              <Check className="size-3" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span
              className="grid size-9 place-items-center rounded font-mono text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: member.color }}
            >
              {member.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-950">{member.name}</span>
                {!member.isActive && (
                  <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 uppercase">
                    pausado
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                {member.services.length > 0
                  ? member.services.map((s) => s.name).join(" · ")
                  : "Sin servicios vinculados"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-7 items-center gap-1 rounded border border-zinc-200 bg-white px-2.5 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
              title="Editar nombre y color"
            >
              <Edit2 className="size-3 text-zinc-500" />
              <span>Editar</span>
            </button>

            <form action={toggleStaffAction}>
              <input type="hidden" name="id" value={member.id} />
              <button
                type="submit"
                className="inline-flex h-7 items-center rounded border border-zinc-200 bg-white px-2.5 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
              >
                {member.isActive ? "Pausar miembro" : "Reactivar"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

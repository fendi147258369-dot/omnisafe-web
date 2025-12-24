import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ReactNode } from "react";

export function Accordion({
  items,
}: {
  items: { id: string; title: string; content: ReactNode }[];
}) {
  return (
    <AccordionPrimitive.Root type="multiple" className="rounded border border-slate-200 bg-white">
      {items.map((item) => (
        <AccordionPrimitive.Item key={item.id} value={item.id} className="border-b border-slate-200 last:border-b-0">
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="flex w-full items-center justify-between bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100">
              {item.title}
              <span className="text-slate-400">▸</span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="px-4 py-3 text-sm text-slate-900 bg-slate-50">
            {item.content}
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef } from "react";
import { EditorToolbar } from "./EditorToolbar";

type RichTextEditorProps = {
  content: string;
  onChange: (json: string) => void;
  editable?: boolean;
};

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
  const isFirstRender = useRef(true);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content ? JSON.parse(content) : undefined,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc max-w-none min-h-[420px] px-6 py-5 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(JSON.stringify(ed.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor || isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      {editable && editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { StudioStatus } from "../../components/Meta/Meta";

const STUDIO_EMAIL = "mvgago26@gmail.com";

const Field: React.FC<{
  label: string;
  name: string;
  type?: string;
  multiline?: boolean;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, name, type = "text", multiline, value, onChange }) => {
  const shared =
    "peer w-full border-0 border-b border-ink/25 bg-transparent pb-3 pt-6 font-sans text-base font-light text-ink outline-none transition-colors duration-500 placeholder:text-transparent focus:border-ink";
  return (
    <label className="relative block">
      {multiline ? (
        <textarea name={name} rows={4} required placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${shared} resize-none`} />
      ) : (
        <input name={name} type={type} required placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
      <span className="meta pointer-events-none absolute left-0 top-0 text-graphite">{label}</span>
    </label>
  );
};

export const AboutPage: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  // No backend: compose the message in the visitor's mail client.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Fuga Haus — ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n${form.name}\n${form.email}`);
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="px-4 pt-24 sm:px-6 md:px-8 md:pt-28">
      <div className="grid grid-cols-12 gap-x-6 gap-y-16">
        <div className="col-span-12 md:col-span-3">
          <motion.p variants={rise} initial="hidden" animate="shown" className="meta text-graphite">
            03 — studio
          </motion.p>
          <motion.div variants={rise} initial="hidden" animate="shown" custom={1} className="mt-6 flex flex-col gap-1 text-graphite">
            <StudioStatus />
          </motion.div>
        </div>

        <div className="col-span-12 md:col-span-8 md:col-start-5">
          <motion.h1
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={1}
            className="font-serif text-4xl font-light leading-[1.1] text-ink sm:text-5xl md:text-6xl"
          >
            Hello, I'm Manu — a digital designer building{" "}
            <em className="text-graphite">quiet, tactile</em> experiences.
          </motion.h1>

          <motion.div
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={2}
            className="mt-12 grid gap-8 font-sans text-[15px] font-light leading-relaxed text-graphite sm:grid-cols-2"
          >
            <p>
              I create digital experiences that evoke emotions and foster connections. With five years of experience, I
              design everything from marketing assets to responsive web applications, guiding each project from
              ideation to deployment.
            </p>
            <p>
              I also collaborate with artists to bring their visions to life, crafting visual environments that enhance
              their identity and connect with audiences. If you made it this far, we're meant to work together.
            </p>
          </motion.div>

          <motion.a
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={3}
            href="/cv.pdf"
            download
            className="meta group mt-12 inline-flex items-center gap-3 text-ink"
          >
            <span className="relative">
              download curriculum
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-50 bg-ink/50 transition-transform duration-700 ease-haus group-hover:scale-x-100" />
            </span>
            <span className="transition-transform duration-700 ease-haus group-hover:translate-y-0.5">↓</span>
          </motion.a>
        </div>

        <motion.section
          className="col-span-12 border-t border-ink/15 pt-12 md:col-span-8 md:col-start-5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="meta text-graphite">correspondence</h2>
          <form onSubmit={onSubmit} className="mt-8 grid gap-10 sm:grid-cols-2">
            <Field label="name" name="name" value={form.name} onChange={set("name")} />
            <Field label="email" name="email" type="email" value={form.email} onChange={set("email")} />
            <div className="sm:col-span-2">
              <Field label="message" name="message" multiline value={form.message} onChange={set("message")} />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="meta rounded-full border border-ink/30 px-8 py-3 text-ink transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-platinum"
              >
                send →
              </button>
            </div>
          </form>
        </motion.section>
      </div>
    </main>
  );
};

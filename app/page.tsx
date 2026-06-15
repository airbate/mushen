import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="font-brush text-5xl text-ink-900 mb-2">赛博半仙</h1>
        <p className="text-ink-500 text-lg">mushen · 中国传统命理的 AI 解读</p>
      </header>

      <section className="mb-12 prose prose-stone max-w-none">
        <p className="text-ink-700 leading-loose">
          一份表单，一段解读。mushen 基于开源工程化方案{" "}
          <a
            href="https://github.com/airbate/Numerologist_skills"
            className="underline decoration-cinnabar decoration-2 underline-offset-4"
            target="_blank"
            rel="noopener"
          >
            Numerologist Skills
          </a>
          ，把紫微斗数、奇门遁甲、四柱八字的排盘交给确定性的计算层，把解读交给国产大模型
          DeepSeek。
        </p>
        <p className="text-ink-500 text-sm mt-6">
          本工具仅供文化体验与命理学习参考，不构成医疗、法律、财务或重大人生决策建议。
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <SkillCard href="/result?skill=ziwei" title="紫微斗数" desc="十二宫 + 十四主星，看本命格局" />
        <SkillCard href="/result?skill=qimen" title="奇门遁甲" desc="一事一断，测事之成败时机" />
        <SkillCard href="/result?skill=bazi" title="四柱八字" desc="四柱十神大运，看一生的强弱流向" />
      </section>

      <footer className="border-t border-ink-100 pt-6 text-sm text-ink-500">
        <p>
          源码：<a className="underline" href="https://github.com/airbate/mushen" target="_blank" rel="noopener">airbate/mushen</a>
        </p>
      </footer>
    </main>
  );
}

function SkillCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block p-6 bg-ink-50 border border-ink-100 rounded-lg hover:bg-ink-100 transition-colors"
    >
      <h3 className="font-serif text-xl text-ink-900 mb-2">{title}</h3>
      <p className="text-sm text-ink-500">{desc}</p>
    </Link>
  );
}
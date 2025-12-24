import { AppShell } from "../../components/layout/AppShell";

export default function VisionPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* 模块一｜初衷 */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
          <h1 className="text-3xl font-bold text-slate-900">OmniSafe 的初衷</h1>
          <p className="text-lg text-slate-700">
            OmniSafe 的诞生，并不是因为链上世界缺少“判断”。相反，我们看到的是：判断太多，事实太少；结论太快，证据太轻。许多工具用评分、标签或简单结论替用户做出“安全 / 危险”的判断，却很少告诉用户这些判断基于什么事实，是否可以被复核。
          </p>
          <p className="text-sm text-slate-600">
            OmniSafe 选择了一条更慢、但更长期的路径：不替任何人下结论，只把链上可验证的事实完整地呈现出来。
          </p>
        </section>

        {/* 模块一补充｜用户承诺 */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">OmniSafe 的用户承诺</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="text-base font-semibold text-slate-900">1. 我们承诺：不因价格区分风控能力</div>
              <p className="mt-2 text-sm text-slate-700 leading-6">
                每一次检测都会执行同一套完整的链上风险分析引擎。无论单次使用还是订阅用户，分析深度与覆盖范围完全一致，差异仅在使用频率与系统优先级。
              </p>
              <p className="text-xs text-slate-500">每一位用户都有看到全面事实的权利。</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-base font-semibold text-slate-900">2. 我们承诺：所有结果均基于可复核的链上事实</div>
              <p className="mt-2 text-sm text-slate-700 leading-6">
                每一条风险提示都来源于当前链上的可验证数据，不使用不可解释的黑盒结论，也不基于主观判断或市场情绪。
              </p>
              <p className="text-xs text-slate-500">任何专业用户，都可以独立复核 OmniSafe 给出的事实依据。</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-base font-semibold text-slate-900">3. 我们承诺：不替用户做投资决策</div>
              <p className="mt-2 text-sm text-slate-700 leading-6">
                OmniSafe 不提供投资建议，也不对资产给出“是否值得购买”的结论。我们只帮助你看清代币结构、权限能力、流动性与资金行为中容易被忽略的部分。
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-base font-semibold text-slate-900">4. 我们承诺：系统能力向所有用户平等开放</div>
              <p className="mt-2 text-sm text-slate-700 leading-6">
                机构级的分析能力被标准化并下放，普通用户、小团队与小型公司都能使用同等的风控深度。风控能力不应是少数人的特权。
              </p>
            </div>
          </div>
        </section>

        {/* 模块二｜原则 */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">我们坚持什么</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="text-base font-semibold text-slate-900">1. 不给评分，不给结论</div>
              <p className="mt-2 text-sm text-slate-700 leading-6">不告诉你“安全 / 危险”，只呈现风险结构与需要注意的链上事实。</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-base font-semibold text-slate-900">2. 所有结果必须可复核</div>
              <p className="mt-2 text-sm text-slate-700 leading-6">每一条提示均来源于当前链上数据，而非黑盒模型或静态规则。</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-base font-semibold text-slate-900">3. 不因价格区分分析能力</div>
              <p className="mt-2 text-sm text-slate-700 leading-6">所有用户获得相同的分析深度与数据范围，风控能力不应成为价格歧视工具。</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-base font-semibold text-slate-900">4. 为研究与风控而设计</div>
              <p className="mt-2 text-sm text-slate-700 leading-6">不服务 FOMO，只服务理性判断与风险认知。</p>
            </div>
          </div>
        </section>

        {/* 模块七｜不承诺的内容 */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">OmniSafe 明确不承诺的内容</h2>
          <p className="text-sm text-slate-700">
            OmniSafe 不承诺以下内容：不承诺任何资产的安全性或收益性；不承诺风险可以被完全消除；不承诺预测市场行为或价格走势；不承诺替用户承担任何投资结果。我们提供的是事实与结构视角，而不是结果保证。
          </p>
        </section>

        {/* 模块三｜当下能力 */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">今天的 OmniSafe 能做什么</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-6">
            <li>多链合约结构与代理模式解析</li>
            <li>权限与潜在控制能力拆解（Mint / Blacklist / Tax / Pause 等）</li>
            <li>全量流动性池分布与主池识别</li>
            <li>Honeypot 与交易可行性分析（基于事实条件）</li>
            <li>开发者与相关地址的链上资金行为分析</li>
            <li>所有分析结果均可独立复核</li>
          </ul>
          <p className="text-sm text-slate-600">这些能力源自机构内部常见的风控流程，已被重构为可重复执行的系统引擎。</p>
        </section>

        {/* 模块四｜路线图方向 */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">我们正在构建的系统能力</h2>
          <p className="text-sm text-slate-700">
            OmniSafe 的目标，并不是做一个“功能集合”，而是逐步构建一套完整的链上风险分析基础设施。未来系统将逐步具备：
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-6">
            <li>跨链资产与风险关系建模</li>
            <li>更精细的权限与可升级路径分析</li>
            <li>项目级与地址级风险行为时间轴</li>
            <li>面向机构与团队的私有化分析接口</li>
            <li>更强的审计与研究辅助能力</li>
          </ul>
          <p className="text-xs text-slate-500">所有新增能力，仍将遵循同一原则：只基于可验证事实，不替任何人做判断。</p>
        </section>

        {/* 模块五｜为谁服务 */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">OmniSafe 为谁而设计</h2>
          <p className="text-sm text-slate-700">
            OmniSafe 并不试图取代任何人的判断。我们服务于：
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 leading-6">
            <li>希望理解链上真实结构的普通用户</li>
            <li>需要辅助判断的小团队与研究者</li>
            <li>需要事实依据的风控与分析部门</li>
          </ul>
          <p className="text-sm text-slate-600">只要你需要的是事实，而不是情绪结论，OmniSafe 都是为你而设计的。</p>
        </section>

        {/* 模块六｜对话与合作 */}
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">对话与合作</h2>
          <p className="text-sm text-slate-700">
            OmniSafe 是一个长期构建中的系统。如果你是研究者、风控从业者、开发者，或希望在合规、风控、分析层面与我们探讨，欢迎与我们直接对话。
            我们重视理性的讨论，也重视对系统能力的建设性反馈。
          </p>
          <a
            href="mailto:team@omnisafe.ai"
            className="inline-flex w-auto items-center justify-center rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            发起专业对话
          </a>
        </section>
      </div>
    </AppShell>
  );
}

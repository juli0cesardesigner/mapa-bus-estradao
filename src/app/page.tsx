export default function Home() {
  return (
    <main className="flex min-height-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          MAPA BUS &nbsp;
          <code className="font-bold">v0.1.0</code>
        </p>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Controle de Embarque
        </h1>
      </div>

      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/admin"
          className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
        >
          Painel Administrativo
        </a>
      </div>
    </main>
  );
}

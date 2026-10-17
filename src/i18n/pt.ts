const days = (n: number) => (n === 1 ? '1 dia' : `${n} dias`)

/** Textos em português (idioma padrão). O inglês segue exatamente este formato. */
export const pt = {
  days,
  /** Descrição de quando o card volta, a partir da diferença em dias para hoje. */
  reviewWhen: (diff: number) => {
    if (diff < 0) return `atrasado há ${days(-diff)}`
    if (diff === 0) return 'hoje'
    if (diff === 1) return 'amanhã'
    return `em ${days(diff)}`
  },
  language: { switchTo: 'English', switchLabel: 'Ver em inglês' },
  common: {
    loading: 'Carregando',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Excluir',
    all: 'Todas',
    categories: 'Categorias',
    reviewIn: 'Revisar em',
  },
  config: {
    title: 'Configuração pendente',
    before: 'Defina as variáveis ',
    middle: ' (veja ',
    after: ' e o README).',
  },
  dashboard: {
    offline: 'Offline',
    importConfirm: (cards: number, categories: number) =>
      `Importar ${cards} cards${categories > 0 ? ` e ${categories} categorias` : ''} para sua conta? Itens com o mesmo id serão atualizados.`,
    invalidBackup: 'Arquivo inválido. Use um backup exportado por este app.',
    legacy: (n: number) =>
      `Encontramos ${n} ${n === 1 ? 'card salvo' : 'cards salvos'} neste navegador. Deseja enviá-los para sua conta?`,
    discard: 'Descartar',
    import: 'Importar',
    close: 'Fechar',
    tabStudy: 'Estudar',
    tabCards: 'Meus cards',
    studyFilter: 'Revisar categorias',
    newCard: 'Novo flashcard',
    addCard: 'Adicionar card',
  },
  menu: {
    account: 'Menu da conta',
    export: 'Exportar backup',
    import: 'Importar backup',
    logout: 'Sair',
  },
  form: {
    title: 'Título (frente)',
    titlePlaceholder: 'Ex.: O que é closure em JavaScript?',
    description: 'Descrição (verso)',
    descriptionPlaceholder: 'A resposta ou explicação que você quer memorizar…',
  },
  list: {
    empty: 'Nenhum card ainda. Crie o primeiro acima!',
    search: (n: number) => `Buscar em ${n} cards…`,
    searchLabel: 'Buscar cards',
    filter: 'Filtrar por categoria',
    notFound: 'Nenhum card encontrado.',
    review: (when: string) => `Revisão ${when}`,
    interval: (intervalDays: number, reviews: number) =>
      `Intervalo: ${days(intervalDays)} · ${reviews} ${reviews === 1 ? 'revisão' : 'revisões'}`,
    studyNow: 'Revisar hoje',
    edit: 'Editar',
    confirmDelete: (title: string) => `Excluir o card "${title}"?`,
  },
  categories: {
    nameRequired: 'Informe um nome.',
    nameTaken: 'Já existe uma categoria com esse nome.',
    confirmDelete: (name: string, used: number) =>
      `Excluir a categoria "${name}"?${used > 0 ? ` Ela será removida de ${used} ${used === 1 ? 'card' : 'cards'}, que não serão excluídos.` : ''}`,
    placeholder: 'Nova categoria, ex.: JavaScript',
    newNameLabel: 'Nome da nova categoria',
    create: 'Criar',
    empty: 'Crie categorias para agrupar seus cards e revisar por assunto.',
    renameLabel: (name: string) => `Novo nome para ${name}`,
    count: (n: number) => `${n} ${n === 1 ? 'card' : 'cards'}`,
    rename: 'Renomear',
    renameAria: (name: string) => `Renomear ${name}`,
    deleteAria: (name: string) => `Excluir ${name}`,
  },
  interval: { suggested: 'Sugerido' },
  study: {
    doneFiltered: 'Categorias em dia!',
    done: 'Tudo em dia!',
    reviewed: (n: number) => `Você revisou ${n} ${n === 1 ? 'card' : 'cards'} nesta sessão.`,
    noneFiltered: 'Nenhum card dessas categorias para revisar hoje.',
    none: 'Nenhum card para revisar hoje.',
    reviewAll: 'Revisar todas as categorias',
    manage: 'Gerenciar cards',
    remaining: (n: number) => (n === 1 ? '1 card restante' : `${n} cards restantes`),
    showFront: 'Mostrar frente',
    showAnswer: 'Mostrar resposta',
    question: 'Pergunta',
    hint: 'Clique ou pressione espaço para ver a resposta',
    answer: 'Resposta',
    how: 'Como foi? Escolha quando revisar novamente:',
    miss: 'Errei',
    hard: 'Difícil',
    hit: 'Acertei',
    custom: 'Escolher outro intervalo',
  },
  sync: {
    cardsLoad: 'Não foi possível carregar seus cards.',
    cardsSave: 'Não foi possível salvar uma alteração. Verifique os dados e tente novamente.',
    categoriesSave: 'Não foi possível salvar uma alteração nas categorias. Tente novamente.',
  },
  landing: {
    title: 'Flashcards — grátis de verdade',
    nav: {
      label: 'Seções',
      how: 'Como funciona',
      benefits: 'Vantagens',
      features: 'Recursos',
      enter: 'Entrar',
      open: 'Abrir o app',
    },
    hero: {
      eyebrow: 'Revisão espaçada · 100% gratuito',
      titleLead: 'Lembre do que estudou.',
      titleEm: 'Sem pagar nada por isso.',
      lead: 'Um app de flashcards direto ao ponto: você escreve o card, ele avisa quando revisar. Sem anúncios, sem assinatura e sem pegadinhas.',
      start: 'Começar agora',
      seeHow: 'Ver como funciona',
      error: 'Não foi possível entrar com o Google. Tente novamente.',
    },
    free: {
      label: 'O que você não vai encontrar aqui',
      points: ['Sem anúncios', 'Sem assinatura', 'Sem plano pago', 'Sem rastreamento'],
    },
    how: {
      title: 'Como funciona',
      createTitle: 'Crie o card',
      createText: 'Escreva a pergunta na frente, a resposta no verso e escolha em quantos dias quer revisar.',
      studyTitle: 'Estude o que venceu',
      studyText: 'A aba Estudar mostra só os cards do dia. Toque para virar e confira se lembrou.',
      answerTitle: 'Responda com sinceridade',
      missText: 'volta amanhã,',
      hardText: 'mantém o intervalo e',
      hitText: 'sobe um degrau na escada:',
      ladderLabel: 'Intervalos de revisão em dias',
      dayUnit: (n: number): string => (n === 1 ? 'dia' : 'dias'),
    },
    benefits: {
      title: 'Por que usar',
      items: [
        {
          title: 'Grátis de verdade',
          text: 'Todos os recursos liberados para todo mundo. Não existe versão “pro” nem limite escondido.',
        },
        {
          title: 'Celular e computador em sincronia',
          text: 'Entre com sua conta Google e os cards aparecem na hora em qualquer aparelho.',
        },
        {
          title: 'Funciona offline',
          text: 'Estude no metrô ou no avião. O que você fizer sem internet é sincronizado sozinho quando ela voltar.',
        },
        {
          title: 'Instala como app',
          text: 'Toque em “Adicionar à tela inicial” e ele abre em tela cheia, como qualquer app, sem passar por loja.',
        },
        {
          title: 'Categorias e estudo focado',
          text: 'Organize os cards em quantas categorias quiser e revise só o que importa para a prova de amanhã.',
        },
        {
          title: 'Seus cards são seus',
          text: 'Faça uma cópia de tudo quando quiser e restaure depois. Nada de ficar preso ao app.',
        },
        {
          title: 'Privacidade por padrão',
          text: 'Ninguém além de você vê seus cards, nada é rastreado e, ao sair da conta, o aparelho não guarda nada.',
        },
        {
          title: 'Simples de usar',
          text: 'Frente, verso e quando revisar. Sem fórmula misteriosa: você sempre sabe quando o card volta.',
        },
        {
          title: 'Leve e rápido',
          text: 'Abre em instantes, até em celular simples, e acompanha o tema claro ou escuro do seu aparelho.',
        },
      ],
    },
    features: {
      title: 'Tudo o que vem dentro',
      intro:
        'Nada de recurso bloqueado: assim que você entra, já tem tudo isto para organizar e acompanhar seus estudos.',
      items: [
        ['Estudar', 'Só os cards que venceram hoje, um por vez. Vire, confira e diga como foi.'],
        ['Meus cards', 'Busque qualquer card, filtre por categoria, edite ou exclua em poucos toques.'],
        ['Revisar antes', 'Tem prova chegando? Antecipe a revisão de um card sem esperar o dia dele.'],
        ['Intervalo do seu jeito', 'Use a escada de 1 a 60 dias ou escolha você mesmo quando o card volta.'],
        ['Categorias', 'Crie as suas, coloque um card em várias e estude uma ou mais de uma vez.'],
        ['Cópia de segurança', 'Baixe todos os seus cards e categorias em um arquivo e restaure quando quiser.'],
      ] as [string, string][],
    },
    closing: {
      title: 'Seu próximo card leva dez segundos.',
      signIn: 'Entrar com Google',
    },
    footer: 'Flashcards · projeto pessoal de ',
    portfolio: 'Ver o portfólio de André Vieira',
  },
  demo: {
    label: 'Demonstração interativa',
    /** Mesma ordem dos intervalos definidos no DemoDeck. */
    cards: [
      {
        front: 'O que é revisão espaçada?',
        back: 'Rever um conteúdo em intervalos cada vez maiores, pouco antes de você esquecê-lo.',
      },
      {
        front: 'Quanto custa este app?',
        back: 'Nada. Sem anúncios, sem assinatura e sem recurso escondido atrás de um plano pago.',
      },
      {
        front: 'Funciona sem internet?',
        back: 'Sim. Estude offline e tudo sincroniza sozinho quando a conexão voltar.',
      },
      {
        front: 'Meus cards ficam presos aqui?',
        back: 'Não. Faça uma cópia de todos os seus cards quando quiser e leve para onde precisar.',
      },
    ],
    questionAria: (front: string) => `Pergunta: ${front}. Toque para ver a resposta.`,
    answerAria: (back: string) => `Resposta: ${back}`,
    frontTag: (interval: number) => `Frente · revisa a cada ${days(interval)}`,
    hint: 'toque para virar',
    backTag: 'Verso',
    feedback: (interval: number) => (interval === 1 ? 'Volta amanhã.' : `Volta em ${days(interval)}.`),
    idle: 'Experimente: vire o card e responda.',
  },
}

export type Messages = typeof pt

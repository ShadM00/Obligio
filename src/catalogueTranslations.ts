/**
 * French and Spanish for the international catalogue.
 *
 * Each translation carries the exact English it was made from, and applies
 * only while the rule still reads that way. When the English changes, owners
 * see the new English rather than a translation of the old wording, until the
 * translation here is updated to match. Keying on the text rather than the
 * title also keeps apart rules that share a title but not a rule, such as
 * food registration in Scotland and in the rest of the UK.
 */
type Translation = {
  en: [string, string];
  fr: [string, string];
  es: [string, string];
};
const translations: Translation[] = [
  {
    en: [
      'ASIC company annual review',
      'For companies registered with ASIC: check the annual statement, pay the review fee by the date shown and check whether a solvency resolution is required. The fee is usually due two months after the review date. A financial-report exception can apply to the resolution. Use your own statement and the official guidance.',
    ],
    fr: [
      'Examen annuel de la société auprès de l’ASIC',
      'Pour les sociétés enregistrées auprès de l’ASIC : vérifiez le relevé annuel, payez les frais à la date indiquée et vérifiez si une résolution de solvabilité est requise. Les frais sont généralement dus deux mois après la date d’examen. Une exception liée au dépôt d’un rapport financier peut concerner la résolution. Consultez votre relevé et les directives officielles.',
    ],
    es: [
      'Revisión anual de la sociedad ante ASIC',
      'Para sociedades registradas ante ASIC: revisa el estado anual, paga la tasa en la fecha indicada y comprueba si se exige una resolución de solvencia. La tasa suele vencer dos meses después de la fecha de revisión. La presentación de un informe financiero puede eximir de la resolución. Consulta tu estado y la guía oficial.',
    ],
  },
  {
    en: [
      'WA food business registration or notification',
      'Before operating, register or notify the relevant enforcement agency. Most food businesses deal with their local government; some are handled by WA Health. Exempt businesses may still need to notify. Registration generally continues until cancelled; do not assume an annual renewal. Check local fees and conditions separately.',
    ],
    fr: [
      'Enregistrement ou notification d’un commerce alimentaire en Australie-Occidentale',
      'Avant de commencer, enregistrez ou notifiez l’activité auprès de l’autorité compétente. La plupart des commerces relèvent de la municipalité; certains relèvent de WA Health. Une activité exemptée peut devoir être notifiée. L’enregistrement reste généralement valide jusqu’à son annulation : ne supposez pas un renouvellement annuel. Vérifiez séparément les frais et conditions locaux.',
    ],
    es: [
      'Registro o notificación de un negocio alimentario en Australia Occidental',
      'Antes de operar, registra o notifica la actividad ante la autoridad competente. La mayoría de los negocios dependen del ayuntamiento; algunos, de WA Health. Los negocios exentos pueden tener que notificar. El registro suele mantenerse hasta su cancelación: no presupongas una renovación anual. Comprueba por separado las tasas y condiciones locales.',
    ],
  },
  {
    en: [
      'City of Perth food business registration',
      'For premises inside the City of Perth council area, register the food business with the City, or notify it if the business is exempt. New fit-outs and structural changes need a building permit, and may need planning approval, before food business approval. The City charges application, assessment and pre-inspection fees, then a fee for each routine inspection; check its page for current amounts. This does not cover the whole Perth metropolitan area.',
    ],
    fr: [
      'Enregistrement d’un commerce alimentaire dans la ville de Perth',
      'Pour les locaux situés dans le territoire municipal de la ville de Perth, enregistrez le commerce alimentaire auprès de la Ville, ou notifiez-le si l’activité est exemptée. Les nouveaux aménagements et modifications structurelles nécessitent un permis de construire, et parfois une autorisation d’urbanisme, avant l’approbation alimentaire. La Ville facture des frais de demande, d’évaluation et de pré-inspection, puis des frais pour chaque inspection de routine; consultez sa page pour les montants actuels. Cette exigence ne couvre pas toute l’agglomération de Perth.',
    ],
    es: [
      'Registro de un negocio alimentario en la ciudad de Perth',
      'Para locales dentro del municipio de la ciudad de Perth, registra el negocio alimentario ante el ayuntamiento, o notifícalo si la actividad está exenta. Las instalaciones nuevas y los cambios estructurales necesitan un permiso de construcción, y pueden necesitar aprobación urbanística, antes de la aprobación alimentaria. El ayuntamiento cobra tasas de solicitud, evaluación e inspección previa, y luego una tasa por cada inspección de rutina; consulta su página para ver los importes vigentes. Esto no cubre toda el área metropolitana de Perth.',
    ],
  },
  {
    en: [
      'Companies House confirmation statement',
      "For UK limited companies, including dormant ones: submit a confirmation statement at least once every twelve months, no later than 14 days after the review period ends. Before filing, every director must have verified their identity with Companies House; the statement asks for each director's personal code and a confirmation that they have verified. People with significant control must verify too, on a timetable that depends on their situation. This is separate from annual accounts and tax returns.",
    ],
    fr: [
      'Déclaration de confirmation auprès de Companies House',
      'Pour les sociétés à responsabilité limitée du Royaume-Uni, y compris les sociétés dormantes : déposez une déclaration de confirmation au moins une fois tous les douze mois, au plus tard 14 jours après la fin de la période d’examen. Avant le dépôt, chaque administrateur doit avoir fait vérifier son identité auprès de Companies House; la déclaration demande le code personnel de chaque administrateur et la confirmation de cette vérification. Les personnes exerçant un contrôle important doivent aussi faire vérifier leur identité, selon un calendrier qui dépend de leur situation. Ce dépôt est distinct des comptes annuels et des déclarations fiscales.',
    ],
    es: [
      'Declaración de confirmación ante Companies House',
      'Para sociedades limitadas del Reino Unido, incluidas las inactivas: presenta una declaración de confirmación al menos una vez cada doce meses, a más tardar 14 días después del fin del período de revisión. Antes de presentarla, cada administrador debe haber verificado su identidad ante Companies House; la declaración pide el código personal de cada administrador y la confirmación de que se verificó. Las personas con control significativo también deben verificar su identidad, en un plazo que depende de su situación. Es distinta de las cuentas anuales y las declaraciones fiscales.',
    ],
  },
  {
    en: [
      'Register a food business with the local authority',
      'Food businesses in England, Wales and Northern Ireland must register with the relevant local authority at least 28 days before trading. Multiple sites require registration with the authority for each site. Confirm whether your activities require registration or a different approval. Scotland has separate guidance.',
    ],
    fr: [
      'Enregistrer un commerce alimentaire auprès de l’autorité locale',
      'En Angleterre, au pays de Galles et en Irlande du Nord, les commerces alimentaires doivent s’enregistrer auprès de l’autorité locale au moins 28 jours avant de commencer. Chaque site doit être enregistré auprès de son autorité. Confirmez si vos activités nécessitent un enregistrement ou une autre autorisation. L’Écosse dispose de directives distinctes.',
    ],
    es: [
      'Registrar un negocio alimentario ante la autoridad local',
      'En Inglaterra, Gales e Irlanda del Norte, los negocios alimentarios deben registrarse ante la autoridad local al menos 28 días antes de operar. Cada local debe registrarse ante su autoridad correspondiente. Confirma si tu actividad requiere registro u otra aprobación. Escocia tiene una guía distinta.',
    ],
  },
  {
    en: [
      'Register a food business with the local authority',
      'Food businesses in Scotland, including those that only distribute food, must register with the environmental health service of their local authority at least 28 days before opening, and register every premises. Registration is free. Some businesses handling meat, fish, egg or dairy products for supply to other businesses need approval instead of registration.',
    ],
    fr: [
      'Enregistrer un commerce alimentaire auprès de l’autorité locale',
      'En Écosse, les commerces alimentaires, y compris ceux qui ne font que distribuer des aliments, doivent s’enregistrer auprès du service de santé environnementale de leur autorité locale au moins 28 jours avant l’ouverture, et enregistrer chaque local. L’enregistrement est gratuit. Certaines entreprises qui manipulent de la viande, du poisson, des œufs ou des produits laitiers destinés à d’autres entreprises doivent obtenir une approbation plutôt qu’un enregistrement.',
    ],
    es: [
      'Registrar un negocio alimentario ante la autoridad local',
      'En Escocia, los negocios alimentarios, incluidos los que solo distribuyen alimentos, deben registrarse ante el servicio de salud ambiental de su autoridad local al menos 28 días antes de abrir, y registrar cada local. El registro es gratuito. Algunos negocios que manipulan carne, pescado, huevos o lácteos para suministrar a otras empresas necesitan una aprobación en lugar de un registro.',
    ],
  },
  {
    en: [
      'Federal corporation annual return',
      'For a federally incorporated business corporation: file an annual return with Corporations Canada within 60 days of the incorporation, amalgamation or continuance anniversary, and file information on individuals with significant control at the same time. This is not a tax return. Not filing can lead to the corporation being dissolved. Provincially incorporated corporations follow their own registry requirements.',
    ],
    fr: [
      'Rapport annuel d’une société de régime fédéral',
      'Pour une société par actions constituée sous le régime fédéral : déposez le rapport annuel auprès de Corporations Canada dans les 60 jours suivant l’anniversaire de constitution, de fusion ou de prorogation, et déposez en même temps les renseignements sur les particuliers ayant un contrôle important. Ce n’est pas une déclaration fiscale. Ne pas le déposer peut entraîner la dissolution de la société. Les sociétés constituées sous le régime provincial suivent les exigences de leur registre.',
    ],
    es: [
      'Declaración anual de una sociedad federal canadiense',
      'Para una sociedad mercantil constituida a nivel federal: presenta la declaración anual ante Corporations Canada dentro de los 60 días del aniversario de constitución, fusión o continuación, y presenta al mismo tiempo la información sobre las personas con control significativo. No es una declaración fiscal. No presentarla puede llevar a la disolución de la sociedad. Las sociedades constituidas a nivel provincial siguen los requisitos de su registro.',
    ],
  },
  {
    en: [
      'BC company annual report',
      'For a company incorporated in British Columbia: file an annual report within two months of its incorporation anniversary. This entry is for BC companies, not federal corporations simply operating in BC. Confirm your registry record and deadline before adopting it.',
    ],
    fr: [
      'Rapport annuel d’une société de la Colombie-Britannique',
      'Pour une société constituée en Colombie-Britannique : déposez un rapport annuel dans les deux mois suivant l’anniversaire de constitution. Cette suggestion concerne les sociétés de la province, pas les sociétés fédérales qui y exercent simplement une activité. Vérifiez votre inscription au registre et l’échéance avant de l’ajouter.',
    ],
    es: [
      'Informe anual de una sociedad de Columbia Británica',
      'Para una sociedad constituida en Columbia Británica: presenta el informe anual dentro de los dos meses del aniversario de constitución. Esta entrada corresponde a sociedades provinciales, no a sociedades federales que solo operen allí. Confirma tu inscripción y el plazo antes de añadirla.',
    ],
  },
  // The live wording until the City of Perth row is synced to the one above;
  // remove once it has been.
  {
    en: [
      'City of Perth food premises approval',
      'For premises inside the City of Perth council area, confirm whether registration or notification is required. New fit-outs and structural changes may need building or planning approval before food-business approval. Contact the City about the form appropriate to your premises. This does not cover the whole Perth metropolitan area.',
    ],
    fr: [
      'Autorisation des locaux alimentaires dans la ville de Perth',
      'Pour les locaux situés dans le territoire municipal de la ville de Perth, vérifiez si un enregistrement ou une notification est requis. Les nouveaux aménagements et modifications structurelles peuvent nécessiter une autorisation de construction ou d’urbanisme avant l’autorisation alimentaire. Demandez à la Ville le formulaire adapté. Cette exigence ne couvre pas toute l’agglomération de Perth.',
    ],
    es: [
      'Aprobación de locales alimentarios en la ciudad de Perth',
      'Para locales dentro del municipio de la ciudad de Perth, confirma si se exige registro o notificación. Las instalaciones nuevas y los cambios estructurales pueden requerir permisos de construcción o urbanismo antes de la aprobación alimentaria. Consulta al ayuntamiento sobre el formulario adecuado. Esto no cubre toda el área metropolitana de Perth.',
    ],
  },
];
const byEnglish = new Map(
  translations.map(entry => [entry.en[0] + '\n' + entry.en[1], entry]),
);

/** Whether this exact English rule text has a translation. */
export function hasTranslation(rule: {
  title: string;
  description: string;
}): boolean {
  return byEnglish.has(rule.title + '\n' + rule.description);
}

export function localizeTemplate<
  T extends { title: string; description: string },
>(rule: T, locale?: string): T {
  const language = locale?.startsWith('fr')
    ? 'fr'
    : locale?.startsWith('es')
    ? 'es'
    : null;
  const translated =
    language && byEnglish.get(rule.title + '\n' + rule.description)?.[language];
  return translated
    ? { ...rule, title: translated[0], description: translated[1] }
    : rule;
}

/** Reviewed English rule text is the source; translations retain its scope and caveats. */
const translations: Record<string, {fr: [string, string]; es: [string, string]}> = {
  'ASIC company annual review': {
    fr: ['Examen annuel de la société auprès de l’ASIC', 'Pour les sociétés enregistrées auprès de l’ASIC : vérifiez le relevé annuel, payez les frais à la date indiquée et vérifiez si une résolution de solvabilité est requise. Les frais sont généralement dus deux mois après la date d’examen. Une exception liée au dépôt d’un rapport financier peut concerner la résolution. Consultez votre relevé et les directives officielles.'],
    es: ['Revisión anual de la sociedad ante ASIC', 'Para sociedades registradas ante ASIC: revisa el estado anual, paga la tasa en la fecha indicada y comprueba si se exige una resolución de solvencia. La tasa suele vencer dos meses después de la fecha de revisión. La presentación de un informe financiero puede eximir de la resolución. Consulta tu estado y la guía oficial.'],
  },
  'WA food business registration or notification': {
    fr: ['Enregistrement ou notification d’un commerce alimentaire en Australie-Occidentale', 'Avant de commencer, enregistrez ou notifiez l’activité auprès de l’autorité compétente. La plupart des commerces relèvent de la municipalité; certains relèvent de WA Health. Une activité exemptée peut devoir être notifiée. L’enregistrement reste généralement valide jusqu’à son annulation : ne supposez pas un renouvellement annuel. Vérifiez séparément les frais et conditions locaux.'],
    es: ['Registro o notificación de un negocio alimentario en Australia Occidental', 'Antes de operar, registra o notifica la actividad ante la autoridad competente. La mayoría de los negocios dependen del ayuntamiento; algunos, de WA Health. Los negocios exentos pueden tener que notificar. El registro suele mantenerse hasta su cancelación: no presupongas una renovación anual. Comprueba por separado las tasas y condiciones locales.'],
  },
  'City of Perth food premises approval': {
    fr: ['Autorisation des locaux alimentaires dans la ville de Perth', 'Pour les locaux situés dans le territoire municipal de la ville de Perth, vérifiez si un enregistrement ou une notification est requis. Les nouveaux aménagements et modifications structurelles peuvent nécessiter une autorisation de construction ou d’urbanisme avant l’autorisation alimentaire. Demandez à la Ville le formulaire adapté. Cette exigence ne couvre pas toute l’agglomération de Perth.'],
    es: ['Aprobación de locales alimentarios en la ciudad de Perth', 'Para locales dentro del municipio de la ciudad de Perth, confirma si se exige registro o notificación. Las instalaciones nuevas y los cambios estructurales pueden requerir permisos de construcción o urbanismo antes de la aprobación alimentaria. Consulta al ayuntamiento sobre el formulario adecuado. Esto no cubre toda el área metropolitana de Perth.'],
  },
  'Companies House confirmation statement': {
    fr: ['Déclaration de confirmation auprès de Companies House', 'Pour les sociétés à responsabilité limitée du Royaume-Uni : vérifiez les informations et déposez une déclaration de confirmation au moins tous les douze mois. Confirmez la période d’examen, l’échéance et les exigences de vérification d’identité auprès de Companies House. Ce dépôt est distinct des comptes annuels et déclarations fiscales.'],
    es: ['Declaración de confirmación ante Companies House', 'Para sociedades limitadas del Reino Unido: revisa los datos de la sociedad y presenta una declaración de confirmación al menos cada doce meses. Confirma el período de revisión, el plazo y los requisitos de verificación de identidad con Companies House. Es distinta de las cuentas anuales y las declaraciones fiscales.'],
  },
  'Register a food business with the local authority': {
    fr: ['Enregistrer un commerce alimentaire auprès de l’autorité locale', 'En Angleterre, au pays de Galles et en Irlande du Nord, les commerces alimentaires doivent s’enregistrer auprès de l’autorité locale au moins 28 jours avant de commencer. Chaque site doit être enregistré auprès de son autorité. Confirmez si vos activités nécessitent un enregistrement ou une autre autorisation. L’Écosse dispose de directives distinctes.'],
    es: ['Registrar un negocio alimentario ante la autoridad local', 'En Inglaterra, Gales e Irlanda del Norte, los negocios alimentarios deben registrarse ante la autoridad local al menos 28 días antes de operar. Cada local debe registrarse ante su autoridad correspondiente. Confirma si tu actividad requiere registro u otra aprobación. Escocia tiene una guía distinta.'],
  },
  'Federal corporation annual return': {
    fr: ['Rapport annuel d’une société de régime fédéral', 'Pour une société par actions constituée sous le régime fédéral : déposez le rapport annuel auprès de Corporations Canada dans les 60 jours suivant l’anniversaire de constitution, de fusion ou de prorogation. Ce n’est pas une déclaration fiscale. Les sociétés provinciales suivent les exigences de leur registre. Vérifiez les dépôts d’informations connexes auprès de Corporations Canada.'],
    es: ['Declaración anual de una sociedad federal canadiense', 'Para una sociedad mercantil constituida a nivel federal: presenta la declaración anual ante Corporations Canada dentro de los 60 días del aniversario de constitución, fusión o continuación. No es una declaración fiscal. Las sociedades provinciales siguen los requisitos de su registro. Confirma los trámites informativos relacionados con Corporations Canada.'],
  },
  'BC company annual report': {
    fr: ['Rapport annuel d’une société de la Colombie-Britannique', 'Pour une société constituée en Colombie-Britannique : déposez un rapport annuel dans les deux mois suivant l’anniversaire de constitution. Cette suggestion concerne les sociétés de la province, pas les sociétés fédérales qui y exercent simplement une activité. Vérifiez votre inscription au registre et l’échéance avant de l’ajouter.'],
    es: ['Informe anual de una sociedad de Columbia Británica', 'Para una sociedad constituida en Columbia Británica: presenta el informe anual dentro de los dos meses del aniversario de constitución. Esta entrada corresponde a sociedades provinciales, no a sociedades federales que solo operen allí. Confirma tu inscripción y el plazo antes de añadirla.'],
  },
};
export function localizeTemplate<T extends {title: string; description: string}>(rule: T, locale?: string): T {
  const language = locale?.startsWith('fr') ? 'fr' : locale?.startsWith('es') ? 'es' : null;
  const translated = language && translations[rule.title]?.[language];
  return translated ? {...rule, title: translated[0], description: translated[1]} : rule;
}

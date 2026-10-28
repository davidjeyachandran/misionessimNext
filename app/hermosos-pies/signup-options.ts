/*
 * Choices offered in step 2 of the "Da el paso" signup. The strings are what
 * reaches the Formspree inbox and its CSV export, so renaming one splits that
 * column's values mid-campaign.
 */

export const QUIERO = [
  "Saber cómo ser pies que sirven con SIM",
  "Orar por pies que sirven con SIM",
  "Dar para pies que sirven con SIM",
];

/*
 * The top-level roles from mi-movilicemos's onboarding question "¿Cual es tu
 * rol en la iglesia?" (poc/mi-movilicemos/src/data/questions.ts), plus
 * "Miembro de la iglesia": that list was written for people already involved
 * in missions, and this campaign reaches ordinary church members too.
 */
export const ROLES = [
  "Pastor/ líder",
  "Candidato/ Misionero",
  "Movilizador",
  "Encargado de cuidado integral",
  "Apoyador / orador de la Misión",
  "Miembro de la iglesia",
];

/**
 * Countries pinned above the full list, with the WhatsApp dial code filled in
 * when one is picked. Names match app/sirve-con-sim/countries.ts exactly, so
 * both forms send the same values.
 */
export const DIAL_CODES: Record<string, string> = {
  Argentina: "+54",
  Bolivia: "+591",
  Brasil: "+55",
  Chile: "+56",
  Colombia: "+57",
  "Costa Rica": "+506",
  Cuba: "+53",
  Ecuador: "+593",
  "El Salvador": "+503",
  España: "+34",
  "Estados Unidos": "+1",
  Guatemala: "+502",
  Honduras: "+504",
  México: "+52",
  Nicaragua: "+505",
  Panamá: "+507",
  Paraguay: "+595",
  Perú: "+51",
  "República Dominicana": "+1",
  Uruguay: "+598",
  Venezuela: "+58",
};

export const PINNED_COUNTRIES = Object.keys(DIAL_CODES);

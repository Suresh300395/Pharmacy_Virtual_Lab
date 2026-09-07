export const FALLBACK_EXPERIMENTS = [
  {
    id: 1,
    experimentId: 1,
    title: 'Study of muscle relaxant activity with the help of "rota rod apparatus".',
    info: 'EFFECT OF CNS SUPPRESSANT AND SKELATEL MUSCLE RELAXANT DRUG ON MICE USING ROTAROD APPARATUS'
  },
  { id: 2, experimentId: 2, title: 'Study of cns depressents & stimulants using "actophotometer".' },
  { id: 3, experimentId: 3, title: 'Study of analgesic activity with the help of "tail flick apparatus".' },
  { id: 4, experimentId: 4, title: 'Study of antihistaminic drugs with the help of histamine chamber (mast cell stabilization method).' },
  { id: 5, experimentId: 5, title: 'Study of analgesic activity with the help of "hot plate apparatus".' },
  { id: 6, experimentId: 6, title: 'Study of drugs acting on cns using "elevated plus maze".' },
  { id: 7, experimentId: 7, title: 'Study of anticonvulsant activity using "electro covulsiometer".' },
  { id: 8, experimentId: 8, title: "Experiment on effects of various drugs on rabbit's eye." },
  { id: 9, experimentId: 9, title: 'To study analgesic activity by writhing test.' },
  { id: 10, experimentId: 10, title: 'To study PTZ induced convulsions in mice.' },
  { id: 11, experimentId: 11, title: "Effect of different drugs on frog's heart." },
  { id: 12, experimentId: 12, title: '2 Modules - 1. Recording of DRC and bioassay of histamine on the ileum of guinea pig by matching method.\n2. Effect of agonist & antagonist on guinea pig ileum.' },
  { id: 13, experimentId: 13, title: 'Experiments of rat blood sugar.' },
  { id: 14, experimentId: 14, title: '3 Modules - To record the dose response curve and to determine the pD2 value for acetylcholine (on frog rectus abdominis muscle), serotonin (on rat fundus strip) and histamine (on guinea pig ileum).' },
  { id: 15, experimentId: 15, title: '4 Modules - Bioassay of acetylcholine (on frog rectus abdominis muscle), oxytocin (on rat uterine horn) and serotonin (on rat fundus strip), Bioassay of acetylcholine (on rat ileum/colon) - by matching, interpolation, 3 point and 4 point method.' },
  { id: 16, experimentId: 16, title: 'Study of diuretic activity using metabolic cage.' },
  { id: 17, experimentId: 17, title: 'Study of anti-inflammatory activity using carrageenan induced paw oedema method.' },
  { id: 18, experimentId: 18, title: 'Rabbit pyrogen test.' },
  { id: 19, experimentId: 19, title: '4 Modules - Effects of drugs on the dog BP and heart rate.' },
  { id: 20, experimentId: 20, title: 'Effects of drugs on the ciliary motility of frog oesophagus (gastro intestinal tract).' },
  { id: 21, experimentId: 21, title: 'Study of anti ulcer activity - using pylorus ligation method.' },
  { id: 22, experimentId: 22, title: 'Study of stereotype and anti-catatonic activity of drugs on mice.' },
  { id: 23, experimentId: 23, title: 'Evaluation of effect of acetylcholine (spasmogens) using rabbit jejunum.' },
  { id: 24, experimentId: 24, title: "Evaluation of anti psychotic drugs using cook's pole climbing apparatus." },
  { id: 25, experimentId: 25, title: "Evaluation of sedative drugs using cook's pole climbing apparatus." },
  { id: 26, experimentId: 26, title: 'Acute skin irritation test (draize test).' },
  { id: 27, experimentId: 27, title: 'Acute eye irritation test (draize test).' },
  { id: 28, experimentId: 28, title: 'Effect of saline purgatives on frog intestine.' },
  { id: 29, experimentId: 29, title: '4 Modules - Amphibian nerve muscle experiments.' },
  { id: 30, experimentId: 30, title: 'Study of effect of hepatic microsomal enzyme inducer on the phenobarbitone sleeping time in mice.' },
  { id: 31, experimentId: 31, title: 'Determination of pA2 value of prazosin using rat anococcygeus muscle (by schilds plot method).' },
  { id: 32, experimentId: 32, title: 'To estimate LD50 using hypothetical data through computer-simulated experimentation (as per OECD 425 guideline) using software.' },
  { id: 33, experimentId: 33, title: 'To record DRC of acetylcholine and to study the potentiating effect of physostigmine on acetylcholine and also to study the antagonizing effect of d-tubocurarine on acetylcholine.' },
  { id: 34, experimentId: 34, title: 'Evaluation of analgesic activity of centrally acting analgesics using tail immersion method.' },
  { id: 35, experimentId: 35, title: 'Evaluation of antidepressant activity of drugs using the tail suspension test.' },
  { id: 36, experimentId: 36, title: 'To study the antiallergic effects of drugs using mast cell degranulation assay.' },
  { id: 37, experimentId: 37, title: "To demonstrate Langendorff's heart assembly and its applications in pharmacology." },
]

export const getExperimentById = (id, experimentsList = []) => {
  if (!id) return FALLBACK_EXPERIMENTS[0]
  const numId = Number(id)
  const found = experimentsList.find(e => Number(e.experimentId || e.id) === numId || e._id === id)
  if (found) return found
  return FALLBACK_EXPERIMENTS.find(e => Number(e.experimentId || e.id) === numId) || FALLBACK_EXPERIMENTS[0]
}

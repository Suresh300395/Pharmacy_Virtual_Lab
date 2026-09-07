const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Experiment = require('../models/Experiment');

dotenv.config();

const DEFAULT_INSTRUCTIONS = [
  'Review the theoretical principle and apparatus setup.',
  'Click Perform Experiment to launch the interactive apparatus.',
  'Administer doses, adjust parameters, and record response data in the virtual lab notebook.',
  'Analyze results and generate final lab report.'
];

const EXPERIMENTS_DATA = [
  {
    experimentId: 1,
    title: 'Study of muscle relaxant activity with the help of "rota rod apparatus".',
    equipment: 'Rotarod apparatus has a horizontal grooved rod rotating at a fixed speed. The mice are made to balance on this rod. Dependent upon their motor co-ordination, Central nervous activity and grip strength the animal either stay on the rotating rod for specific time and after that fall down on the platform of each compartment. The floor of each compartment has sensors that deactivate the timers and the exact fall off time for each rat is displayed on the respective display.',
    principle: 'Reduction of motor co-ordination, CNS depression and skeletal muscle relaxation lead to decrease in the fall off time and decrease in number of free ridings of animal balancing on the rotarod. Thus lesser fall off time and less number of free ridings indicate that the administered drug has CNS depressant or muscle relaxant activity that either lead to decrease in the motor co-ordination or decrease in the gripping power.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 2,
    title: 'Study of cns depressents & stimulants using "actophotometer".',
    equipment: 'Actophotometer consists of a square arena with infrared photocell beams placed across the walls. When animal moves across the arena, it breaks the light beams which are automatically registered as counts on the digital display unit.',
    principle: 'Locomotor activity represents general central nervous system excitability. CNS depressants decrease the locomotor activity counts whereas CNS stimulants significantly increase the photocell counts.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 3,
    title: 'Study of analgesic activity with the help of "tail flick apparatus".',
    equipment: 'Tail flick analgesiometer equipped with a nichrome wire heating coil or focused radiant heat source focused at a specific point on the rat or mouse tail, connected to a digital cut-off timer.',
    principle: 'Application of radiant heat to the tail induces a spinal thermal pain reflex causing the animal to flick its tail away. Centrally acting analgesics prolong the reaction time before tail flick occurs.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 4,
    title: 'Study of antihistaminic drugs with the help of histamine chamber (mast cell stabilization method).',
    equipment: 'Perspex aerosol histamine chamber connected to a micro-nebulizer for delivering controlled histamine aerosol spray at constant pressure.',
    principle: 'Histamine aerosol exposure induces bronchospasm and dyspnoea in conscious guinea pigs. Antihistaminic drugs delay the onset of dyspnoea and stabilize mast cell membranes.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 5,
    title: 'Study of analgesic activity with the help of "hot plate apparatus".',
    equipment: 'Eddy\'s Hot Plate apparatus maintaining a constant temperature (typically 55°C ± 0.5°C) surrounded by a clear acrylic cylinder container.',
    principle: 'Heat-induced pain causes paw licking or jumping response in mice. Analgesic agents prolong the latency period for these thermal nociceptive responses.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 6,
    title: 'Study of drugs acting on cns using "elevated plus maze".',
    equipment: 'Elevated Plus Maze consisting of two open arms and two closed arms elevated 50 cm above the floor level.',
    principle: 'Anxiety induces aversion to open and high spaces. Anxiolytic drugs increase the time spent and entries into the open arms of the maze.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 7,
    title: 'Study of anticonvulsant activity using "electro covulsiometer".',
    equipment: 'Electro-convulsiometer with ear-clip or corneal electrodes delivering regulated AC current pulses.',
    principle: 'Electroshock induces Maximal Electroshock Seizures (MES) characterized by tonic hindlimb extension. Anticonvulsants suppress the tonic extensor phase.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 8,
    title: "Experiment on effects of various drugs on rabbit's eye.",
    equipment: 'Rabbit holder, light beam source, millimeter scale or pupilometer, cotton swab, and drug solutions (Atropine, Pilocarpine, Ephedrine, Physostigmine).',
    principle: 'Autonomic drugs act on corneal reflexes, pupillary size (miosis/mydriasis), and light reflexes via parasympathetic and sympathetic pathways in the iris sphincter and dilator muscles.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 9,
    title: 'To study analgesic activity by writhing test.',
    equipment: 'Observation cage, syringe with 27G needle, 0.6% v/v Acetic Acid solution or Phenylquinone solution.',
    principle: 'Intraperitoneal injection of acetic acid causes chemical visceral nociception manifesting as abdominal constriction and hindlimb extension (writhing). Analgesics reduce the total count of writhes.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 10,
    title: 'To study PTZ induced convulsions in mice.',
    equipment: 'Observation cage, stopwatch, Pentylenetetrazole (PTZ) solution (80 mg/kg s.c. or i.p.).',
    principle: 'PTZ acts as a GABAA receptor antagonist inducing clonic and tonic seizures. Antiepileptic drugs delay seizure onset or prevent convulsive mortality.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 11,
    title: "Effect of different drugs on frog's heart.",
    equipment: 'Frog heart perfusion apparatus, Sterling heart lever, kymograph drum, Ringer solution reservoir, drugs (Adrenaline, Acetylcholine, Atropine, Propranolol).',
    principle: 'Cardiovascular drugs alter heart rate (chronotropic) and force of contraction (inotropic) by acting on adrenergic and muscarinic receptors on cardiac tissue.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 12,
    title: '2 Modules - 1. Recording of DRC and bioassay of histamine on the ileum of guinea pig by matching method. 2. Effect of agonist & antagonist on guinea pig ileum.',
    equipment: 'Student Organ Bath, isotonic frontal writing lever, aerator tube, Tyrode solution reservoir, kymograph paper.',
    principle: 'Histamine induces concentration-dependent contraction of guinea pig ileum via H1 receptors. Bioassay matching determines unknown concentration by comparing contractions.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 13,
    title: 'Experiments of rat blood sugar.',
    equipment: 'Glucometer, test strips, rodent restrainer, lancets, Insulin and Glibenclamide solutions.',
    principle: 'Hypoglycemic drugs (Insulin, Sulfonylureas) decrease fasting blood glucose concentrations by increasing glucose uptake or stimulating pancreatic insulin secretion.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 14,
    title: '3 Modules - To record the dose response curve and to determine the pD2 value for acetylcholine (on frog rectus abdominis muscle), serotonin (on rat fundus strip) and histamine (on guinea pig ileum).',
    equipment: 'Organ bath, tissue holder, aerator, isometric transducer/writing lever, physiological salt solutions.',
    principle: 'The pD2 value (-log EC50) quantifies agonist affinity for specific tissue receptors based on the log dose-response curve.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 15,
    title: '4 Modules - Bioassay of acetylcholine (on frog rectus abdominis muscle), oxytocin (on rat uterine horn) and serotonin (on rat fundus strip),Bioassay of acetylcholine (on rat ileum/colon) - by matching, interpolation, 3 point and 4 point method.',
    equipment: 'Organ bath setup, bioassay levers, physiological reservoirs, multichannel recording system.',
    principle: 'Quantitative bioassays determine biological potency of unknown drug samples using matching, interpolation, 3-point (2+1) or 4-point (2+2) statistical assay designs.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 16,
    title: 'Study of diuretic activity using metabolic cage.',
    equipment: 'Lipschitz metabolic cage for rodents, measuring cylinder, flame photometer / ion selective electrode for Na+/K+ analysis.',
    principle: 'Diuretics increase total urine volume (volumetric diuresis) and urinary excretion of sodium and chloride ions (saluresis).',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 17,
    title: 'Study of anti-inflammatory activity using carrageenan induced paw oedema method.',
    equipment: 'Plethysmometer / Vernier caliper, Carrageenan 1% w/v subplantar injection.',
    principle: 'Subplantar injection of carrageenan induces biphasic acute inflammatory paw oedema. Anti-inflammatory drugs inhibit prostaglandin synthesis and reduce paw volume.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 18,
    title: 'Rabbit pyrogen test.',
    equipment: 'Pyrogen-free rectal probe thermistor, rabbit restraining box, sterile pyrogen-free glassware & saline.',
    principle: 'Intravenous injection of pyrogenic bacterial endotoxins causes temperature elevation in rabbits. Test evaluates safety of parenteral formulations.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 19,
    title: '4 Modules - Effects of drugs on the dog BP and heart rate.',
    equipment: 'Computerized simulated hemodynamic module, arterial pressure transducer, electrocardiogram leads.',
    principle: 'Autonomic and cardiovascular drugs alter mean arterial pressure, systolic/diastolic BP, and pulse rate by acting on alpha, beta, and muscarinic vascular receptors.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 20,
    title: 'Effects of drugs on the ciliary motility of frog oesophagus (gastro intestinal tract).',
    equipment: 'Dissecting board, poppy seeds or small charcoal particles, stop watch, Frog Ringer solution.',
    principle: 'Ciliary movement along esophageal mucosa propels particles. Cholinergic agents enhance ciliary movement speed whereas anticholinergics depress ciliary motility.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 21,
    title: 'Study of anti ulcer activity - using pylorus ligation method.',
    equipment: 'Surgical dissection kit, pH meter, burette for 0.01N NaOH titration, gastric juice collector.',
    principle: 'Pyloric ligation leads to accumulation of acidic gastric juice causing mucosal ulceration. Anti-ulcer drugs reduce free/total acidity and ulcer index.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 22,
    title: 'Study of stereotype and anti-catatonic activity of drugs on mice.',
    equipment: 'Cataleptic wooden block (3.5 cm & 9 cm high), observation glass cylinder, Amphetamine/Haloperidol.',
    principle: 'Dopaminergic receptor antagonists (Haloperidol) induce cataleptic immobility, whereas dopaminergic agonists or anti-catatonic drugs reverse motor rigidity.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 23,
    title: 'Evaluation of effect of acetylcholine (spasmogens) using rabbit jejunum.',
    equipment: 'Organ bath, Finkleman setup, pendulum lever, aerated Tyrode solution.',
    principle: 'Rabbit jejunum exhibits spontaneous pendular movements. Spasmogens increase tone and contraction frequency, inhibited by antispasmodics.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 24,
    title: "Evaluation of anti psychotic drugs using cook's pole climbing apparatus.",
    equipment: "Cook's Pole Climbing Apparatus with electrified grid floor and central wooden climbing pole.",
    principle: 'Neuroleptics selectively block Conditioned Avoidance Response (CAR) without affecting Unconditioned Response (UR) in trained rodents.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 25,
    title: "Evaluation of sedative drugs using cook's pole climbing apparatus.",
    equipment: "Cook's Pole Climbing Apparatus, timer, sound buzzer & electric shock stimulator.",
    principle: 'Sedatives suppress central alertness and impair motor execution of conditioned escape responses.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 26,
    title: 'Acute skin irritation test (draize test).',
    equipment: 'Shaving clippers, Draize scoring scale, occlusive dressing patches.',
    principle: 'Dermal application of chemicals on rabbit skin evaluates erythema and oedema formation according to OECD test guideline 404.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 27,
    title: 'Acute eye irritation test (draize test).',
    equipment: 'Ophthalmic examination loupe, fluorescein sodium stain, OECD Draize scoring chart.',
    principle: 'Instillation of test substance into rabbit conjunctival sac assesses ocular lesions in cornea, iris, and conjunctiva as per OECD guideline 405.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 28,
    title: 'Effect of saline purgatives on frog intestine.',
    equipment: 'Isolated frog intestinal loops, ligatures, isotonic and hypertonic saline solutions.',
    principle: 'Saline purgatives (Magnesium sulfate) act osmotically in intestinal lumen, drawing fluid into intestine and producing distension.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 29,
    title: '4 Modules - Amphibian nerve muscle experiments.',
    equipment: 'Gastrocnemius-sciatic nerve preparation setup, nerve stimulator, kymograph drum.',
    principle: 'Electrical stimulation of sciatic nerve induces simple muscle twitch, summation, tetanus, and muscle fatigue phenomena.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 30,
    title: 'Study of effect of hepatic microsomal enzyme inducer on the phenobarbitone sleeping time in mice.',
    equipment: 'Phenobarbitone sodium solution, Phenobarbital/Rifampicin inducer, loss of righting reflex timer.',
    principle: 'Enzyme inducers accelerate drug metabolism in liver microsomes, resulting in shortened duration of phenobarbitone-induced loss of righting reflex.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 31,
    title: 'Determination of pA2 value of prazosin using rat anococcygeus muscle (by schilds plot method).',
    equipment: 'Organ bath, Krebs-Henseleit solution, isometric force transducer, Schild plot analysis software.',
    principle: 'Competitive antagonist pA2 (-log concentration of antagonist that doubles agonist requirement) is derived from Schild plot slope.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 32,
    title: 'To estimate LD50 using hypothetical data through computer-simulated experimentation (as per OECD 425 guideline) using software.',
    equipment: 'Computer simulation software for OECD Guideline 425 Up-and-Down Procedure.',
    principle: 'Dose progression algorithm estimates Median Lethal Dose (LD50) minimizing total animal usage in acute toxicity testing.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 33,
    title: 'To record DRC of acetylcholine and to study the potentiating effect of physostigmine on acetylcholine and also to study the antagonizing effect of d-tubocurarine on acetylcholine.',
    equipment: 'Frog rectus abdominis preparation, organ bath, isotonic muscle lever, Acetylcholine, Physostigmine, d-Tubocurarine.',
    principle: 'Physostigmine inhibits acetylcholinesterase potentiating ACh contractions; d-Tubocurarine blocks nicotinic receptors competitively.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 34,
    title: 'Evaluation of analgesic activity of centrally acting analgesics using tail immersion method.',
    equipment: 'Thermostatically controlled water bath (55°C ± 0.5°C), stopwatch, restrainer.',
    principle: 'Tail immersion in hot water induces reflex withdrawal. Opioid analgesics significantly elevate tail withdrawal threshold time.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 35,
    title: 'Evaluation of antidepressant activity of drugs using the tail suspension test.',
    equipment: 'Tail suspension box with suspension hook, video tracking or manual immobility counter.',
    principle: 'Suspension of mice by tail induces behavioral despair (immobility). Antidepressant agents reduce total duration of immobility.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 36,
    title: 'To study the antiallergic effects of drugs using mast cell degranulation assay.',
    equipment: 'Rat peritoneal mast cell isolation chamber, Compound 48/80, Toluidine blue stain, light microscope.',
    principle: 'Compound 48/80 induces mast cell degranulation releasing histamine; antiallergic drugs stabilize mast cell membranes.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
  {
    experimentId: 37,
    title: "To demonstrate Langendorff's heart assembly and its applications in pharmacology.",
    equipment: "Langendorff isolated heart perfusion system, peristaltic pump, pressure transducer, heart lever, Krebs-Henseleit buffer.",
    principle: 'Retrograde aortic perfusion maintains viable isolated mammalian heart allowing evaluation of coronary flow, heart rate, and force of contraction.',
    instructions: DEFAULT_INSTRUCTIONS,
  },
];

const seedExperiments = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas successfully.');

    for (const expData of EXPERIMENTS_DATA) {
      await Experiment.findOneAndUpdate(
        { experimentId: expData.experimentId },
        {
          title: expData.title,
          equipment: expData.equipment,
          principle: expData.principle,
          instructions: expData.instructions,
          isActive: true,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    console.log(`Successfully updated all ${EXPERIMENTS_DATA.length} experiments with Equipment, Principle & Instructions in database.`);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding experiments:', error);
    process.exit(1);
  }
};

seedExperiments();

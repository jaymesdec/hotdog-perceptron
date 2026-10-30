/**
 * Short, plain-language explanations for the always-available "Explain this"
 * affordance (spec §8). Keep them conversational and jargon-light.
 */

export type Concept =
  | 'weight'
  | 'bias'
  | 'score'
  | 'threshold'
  | 'label'
  | 'epoch'
  | 'testSet'
  | 'feature'
  | 'error'
  | 'update'

export const EXPLANATIONS: Record<Concept, { title: string; body: string }> = {
  feature: {
    title: 'Feature',
    body: 'A yes/no fact the detector is allowed to notice — here, whether there is ketchup, mustard, or a bun. The detector never sees the picture, only these three numbers.',
  },
  weight: {
    title: 'Weight',
    body: 'How much one feature pushes the score. A big positive weight means "this feature makes it more likely a hot dog"; a negative weight pushes the other way.',
  },
  bias: {
    title: 'Bias',
    body: 'A number added to every score no matter what the features are. It shifts how eager the detector is to say "Hot dog". It is not attached to any food feature.',
  },
  score: {
    title: 'Score (distance from the decision line)',
    body: 'Each feature times its weight, all added up, plus the bias. It is a signed distance from the decision line — not a probability and not a confidence percentage.',
  },
  threshold: {
    title: 'Threshold',
    body: 'The decision line, fixed at zero. A score of zero or above predicts "Hot dog"; below zero predicts "Not hot dog".',
  },
  label: {
    title: 'Label',
    body: 'The true answer a human already knows for an example: hot dog or not. During training the detector compares its guess to this label.',
  },
  epoch: {
    title: 'Epoch',
    body: 'One full pass through all of your training examples. Doing more epochs lets the detector revisit examples it got wrong.',
  },
  testSet: {
    title: 'Test set',
    body: 'Images the detector never trained on. Testing checks whether it really learned the idea, instead of just memorizing. Parameters stay locked during testing.',
  },
  error: {
    title: 'Error',
    body: 'The true label minus the prediction. It is +1 if a hot dog was missed, -1 if something was wrongly called a hot dog, and 0 when the guess was right.',
  },
  update: {
    title: 'Learning update',
    body: 'When the detector makes a mistake, the classic rule nudges the weights of the active features and the bias. A correct guess changes nothing.',
  },
}

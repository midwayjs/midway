import { start as FCStart, BootstrapStarter as FCBootstrapStarter } from './fc';
import {
  start as SCFStart,
  BootstrapStarter as SCFBootstrapStarter,
} from './scf';

export const FC = {
  start: FCStart,
  BootstrapStarter: FCBootstrapStarter,
};

export const SCF = {
  start: SCFStart,
  BootstrapStarter: SCFBootstrapStarter,
};

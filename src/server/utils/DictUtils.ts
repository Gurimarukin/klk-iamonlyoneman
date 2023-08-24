import { Dict, List, Tuple } from '../../shared/utils/fp'

export const DictUtils = {
  entries: Object.entries as <K extends string, A>(r: Dict<K, A>) => List<Tuple<K, A>>,
}

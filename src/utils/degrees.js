import csData from '../data/cs.json'
import aiData from '../data/ai.json'
import dsData from '../data/data_science.json'
import cyData from '../data/cybersecurity.json'
import seData from '../data/software_engineering.json'

export const DEGREE_MAP = {
  BCS: { label: 'Computer Science', icon: '💻', data: csData },
  BAI: { label: 'Artificial Intelligence', icon: '🤖', data: aiData },
  BDS: { label: 'Data Science', icon: '📊', data: dsData },
  BCT: { label: 'Cyber Security', icon: '🔒', data: cyData },
  BSE: { label: 'Software Engineering', icon: '🛠️', data: seData },
}

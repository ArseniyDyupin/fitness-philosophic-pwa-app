#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Маппинг старых импортов на новые
const importMappings = {
  // Organisms
  "from '../components/Header'": "from '@organisms'",
  "from '../../components/Header'": "from '@organisms'",
  "from '../../../components/Header'": "from '@organisms'",
  
  "from '../components/WorkoutForm'": "from '@organisms'",
  "from '../../components/WorkoutForm'": "from '@organisms'",
  "from '../../../components/WorkoutForm'": "from '@organisms'",
  
  "from '../components/workout/WorkoutHeader'": "from '@organisms'",
  "from '../../components/workout/WorkoutHeader'": "from '@organisms'",
  "from '../../../components/workout/WorkoutHeader'": "from '@organisms'",
  
  "from '../components/workout/WeekSection'": "from '@organisms'",
  "from '../../components/workout/WeekSection'": "from '@organisms'",
  "from '../../../components/workout/WeekSection'": "from '@organisms'",
  
  "from '../components/workout/WeekSummary'": "from '@organisms'",
  "from '../../components/workout/WeekSummary'": "from '@organisms'",
  "from '../../../components/workout/WeekSummary'": "from '@organisms'",
  
  "from '../components/PlanSummary'": "from '@organisms'",
  "from '../../components/PlanSummary'": "from '@organisms'",
  "from '../../../components/PlanSummary'": "from '@organisms'",
  
  "from '../components/PlanExerciseCard'": "from '@organisms'",
  "from '../../components/PlanExerciseCard'": "from '@organisms'",
  "from '../../../components/PlanExerciseCard'": "from '@organisms'",
  
  "from '../components/stats/BodyMetricsBlock'": "from '@organisms'",
  "from '../../components/stats/BodyMetricsBlock'": "from '@organisms'",
  "from '../../../components/stats/BodyMetricsBlock'": "from '@organisms'",
  
  "from '../components/stats/Records'": "from '@organisms'",
  "from '../../components/stats/Records'": "from '@organisms'",
  "from '../../../components/stats/Records'": "from '@organisms'",
  
  "from '../components/stats/StatsHeader'": "from '@organisms'",
  "from '../../components/stats/StatsHeader'": "from '@organisms'",
  "from '../../../components/stats/StatsHeader'": "from '@organisms'",
  
  "from '../components/stats/DisciplineBreakdown'": "from '@organisms'",
  "from '../../components/stats/DisciplineBreakdown'": "from '@organisms'",
  "from '../../../components/stats/DisciplineBreakdown'": "from '@organisms'",
  
  "from '../components/weekly/WeeklyActivityChart'": "from '@organisms'",
  "from '../../components/weekly/WeeklyActivityChart'": "from '@organisms'",
  "from '../../../components/weekly/WeeklyActivityChart'": "from '@organisms'",
  
  "from '../components/home/HomeKPI'": "from '@organisms'",
  "from '../../components/home/HomeKPI'": "from '@organisms'",
  "from '../../../components/home/HomeKPI'": "from '@organisms'",
  
  "from '../components/home/HomeBanners'": "from '@organisms'",
  "from '../../components/home/HomeBanners'": "from '@organisms'",
  "from '../../../components/home/HomeBanners'": "from '@organisms'",
  
  "from '../components/home/NextWorkoutCard'": "from '@organisms'",
  "from '../../components/home/NextWorkoutCard'": "from '@organisms'",
  "from '../../../components/home/NextWorkoutCard'": "from '@organisms'",
  
  "from '../components/home/RecentWorkouts'": "from '@organisms'",
  "from '../../components/home/RecentWorkouts'": "from '@organisms'",
  "from '../../../components/home/RecentWorkouts'": "from '@organisms'",
  
  "from '../components/ProfileSummary'": "from '@organisms'",
  "from '../../components/ProfileSummary'": "from '@organisms'",
  "from '../../../components/ProfileSummary'": "from '@organisms'",
  
  // Molecules
  "from '../components/workout/WeekNavigator'": "from '@molecules'",
  "from '../../components/workout/WeekNavigator'": "from '@molecules'",
  "from '../../../components/workout/WeekNavigator'": "from '@molecules'",
  
  "from '../components/home/GenerateWorkoutButton'": "from '@molecules'",
  "from '../../components/home/GenerateWorkoutButton'": "from '@molecules'",
  "from '../../../components/home/GenerateWorkoutButton'": "from '@molecules'",
  
  // Templates
  "from '../components/OnboardingLayout'": "from '@templates'",
  "from '../../components/OnboardingLayout'": "from '@templates'",
  "from '../../../components/OnboardingLayout'": "from '@templates'",
  
  // Modals
  "from '../components/AISettings'": "from '@modals'",
  "from '../../components/AISettings'": "from '@modals'",
  "from '../../../components/AISettings'": "from '@modals'",
  
  "from '../components/BodyMetricsModal'": "from '@modals'",
  "from '../../components/BodyMetricsModal'": "from '@modals'",
  "from '../../../components/BodyMetricsModal'": "from '@modals'",
  
  "from '../components/DataImport'": "from '@modals'",
  "from '../../components/DataImport'": "from '@modals'",
  "from '../../../components/DataImport'": "from '@modals'",
  
  "from '../components/GenerateWorkoutModal'": "from '@modals'",
  "from '../../components/GenerateWorkoutModal'": "from '@modals'",
  "from '../../../components/GenerateWorkoutModal'": "from '@modals'",
  
  "from '../components/ProfileDetailsModal'": "from '@modals'",
  "from '../../components/ProfileDetailsModal'": "from '@modals'",
  "from '../../../components/ProfileDetailsModal'": "from '@modals'",
  
  "from '../components/workout/EditWorkoutMetaModal'": "from '@modals'",
  "from '../../components/workout/EditWorkoutMetaModal'": "from '@modals'",
  "from '../../../components/workout/EditWorkoutMetaModal'": "from '@modals'",
  
  "from '../components/workout/ExerciseEditModal'": "from '@modals'",
  "from '../../components/workout/ExerciseEditModal'": "from '@modals'",
  "from '../../../components/workout/ExerciseEditModal'": "from '@modals'",
  
  "from '../components/stats/RecordChartModal'": "from '@modals'",
  "from '../../components/stats/RecordChartModal'": "from '@modals'",
  "from '../../../components/stats/RecordChartModal'": "from '@modals'",
  
  // Feature-specific components
  "from '../components/workout/AiFeedbackCard'": "from '@features/workouts/components'",
  "from '../../components/workout/AiFeedbackCard'": "from '@features/workouts/components'",
  "from '../../../components/workout/AiFeedbackCard'": "from '@features/workouts/components'",
  
  "from '../components/stats/AiBodyEvalCard'": "from '@features/stats/components'",
  "from '../../components/stats/AiBodyEvalCard'": "from '@features/stats/components'",
  "from '../../../components/stats/AiBodyEvalCard'": "from '@features/stats/components'",
  
  "from '../components/settings/SettingsBodyMetrics'": "from '@features/metrics/components'",
  "from '../../components/settings/SettingsBodyMetrics'": "from '@features/metrics/components'",
  "from '../../../components/settings/SettingsBodyMetrics'": "from '@features/metrics/components'",
  
  // Path mappings
  "from '../stores/": "from '@stores/",
  "from '../../stores/": "from '@stores/",
  "from '../../../stores/": "from '@stores/",
  
  "from '../services/": "from '@services/",
  "from '../../services/": "from '@services/",
  "from '../../../services/": "from '@services/",
  
  "from '../types/": "from '@types/",
  "from '../../types/": "from '@types/",
  "from '../../../types/": "from '@types/",
  
  "from '../lib/": "from '@lib/",
  "from '../../lib/": "from '@lib/",
  "from '../../../lib/": "from '@lib/",
  
  "from '../utils/": "from '@utils/",
  "from '../../utils/": "from '@utils/",
  "from '../../../utils/": "from '@utils/"
};

// Функция для обновления файла
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Применяем маппинги
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Функция для рекурсивного обхода директорий
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      updateFile(filePath);
    }
  }
}

// Запуск скрипта
const srcDir = path.join(__dirname, 'src');
console.log('Updating imports in:', srcDir);
walkDirectory(srcDir);
console.log('Import update completed!');

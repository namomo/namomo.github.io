import { create } from 'zustand';

const DEFAULT_SERIES_CONFIG = [
  { key: 'seriesA', label: '계열 1' },
  { key: 'seriesB', label: '계열 2' },
  { key: 'seriesC', label: '계열 3' },
  { key: 'seriesD', label: '계열 4' }
];

const DEFAULT_ROWS = [
  { id: 1, label: '항목 A', seriesA: 120, seriesB: 150, seriesC: 100, seriesD: 130 },
  { id: 2, label: '항목 B', seriesA: 140, seriesB: 180, seriesC: 110, seriesD: 150 },
  { id: 3, label: '항목 C', seriesA: 90, seriesB: 110, seriesC: 80, seriesD: 95 },
  { id: 4, label: '항목 D', seriesA: 80, seriesB: 130, seriesC: 70, seriesD: 110 },
  { id: 5, label: '항목 E', seriesA: 110, seriesB: 140, seriesC: 90, seriesD: 120 }
];

const useChartStore = create((set, get) => ({
  chartType: 'line', // 'line' | 'bar' | 'pie'
  rows: [...DEFAULT_ROWS],
  seriesConfig: [...DEFAULT_SERIES_CONFIG],
  isGenerated: false,
  
  // 차트 렌더링에 사용될 최종 확정 데이터 스냅샷
  renderedRows: [],
  renderedSeriesConfig: [],

  setChartType: (type) => set({ chartType: type }),

  // 동적 데이터 행(Row) 추가
  addRow: () => {
    const { rows, seriesConfig } = get();
    const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    
    // 현재 구성된 모든 계열(Series)에 대해 기본값 0 할당
    const newRow = { id: nextId, label: `항목 ${nextId}` };
    seriesConfig.forEach(s => {
      newRow[s.key] = 0;
    });

    set({ rows: [...rows, newRow] });
  },

  removeRow: (id) => {
    const { rows } = get();
    set({ rows: rows.filter(r => r.id !== id) });
  },

  // 동적 열(Series) 추가
  addSeries: () => {
    const { seriesConfig, rows } = get();
    const nextIndex = seriesConfig.length + 1;
    const nextKey = `series_${nextIndex}_${Date.now().toString().slice(-4)}`; // 고유 키 생성
    const newConfig = { key: nextKey, label: `계열 ${nextIndex}` };

    // 모든 기존 행들에 신규 키에 대한 초깃값 0 할당
    const updatedRows = rows.map(r => ({
      ...r,
      [nextKey]: 0
    }));

    set({
      seriesConfig: [...seriesConfig, newConfig],
      rows: updatedRows
    });
  },

  // 동적 열(Series) 삭제
  removeSeries: (key) => {
    const { seriesConfig, rows } = get();
    if (seriesConfig.length <= 1) return; // 최소 1개의 열은 남겨두어야 함

    const updatedConfig = seriesConfig.filter(s => s.key !== key);
    const updatedRows = rows.map(r => {
      const copy = { ...r };
      delete copy[key];
      return copy;
    });

    set({
      seriesConfig: updatedConfig,
      rows: updatedRows
    });
  },

  updateRowValue: (id, field, value) => {
    const { rows } = get();
    const updatedRows = rows.map(r => {
      if (r.id === id) {
        let val = value;
        // label 이외의 모든 동적 계열 필드는 수치형 데이터로 취급
        if (field !== 'label') {
          if (value === '') {
            val = '';
          } else {
            const parsed = parseFloat(value);
            val = isNaN(parsed) ? 0 : parsed;
          }
        }
        return { ...r, [field]: val };
      }
      return r;
    });
    set({ rows: updatedRows });
  },

  updateSeriesLabel: (key, newLabel) => {
    const { seriesConfig } = get();
    const updatedConfig = seriesConfig.map(s => 
      s.key === key ? { ...s, label: newLabel } : s
    );
    set({ seriesConfig: updatedConfig });
  },

  generateChart: () => {
    const { rows, seriesConfig } = get();
    // 데이터 스냅샷 전처리 (빈 문자열 입력 시 0으로 보정)
    const sanitizedRows = rows.map(r => {
      const copy = { ...r };
      seriesConfig.forEach(s => {
        const val = copy[s.key] === '' ? 0 : copy[s.key];
        copy[s.key] = val;
      });
      return copy;
    });
    
    set({
      renderedRows: sanitizedRows,
      renderedSeriesConfig: [...seriesConfig],
      isGenerated: true
    });
  },

  resetData: () => {
    set({
      chartType: 'line',
      rows: DEFAULT_ROWS.map(r => ({ ...r })),
      seriesConfig: DEFAULT_SERIES_CONFIG.map(s => ({ ...s })),
      isGenerated: false,
      renderedRows: [],
      renderedSeriesConfig: []
    });
  }
}));

export default useChartStore;

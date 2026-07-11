import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  Box,
  Typography,
  Tooltip,
  Stack,
} from '@mui/material';
import { Plus, Trash2, Edit3, X, Play, RotateCcw } from 'lucide-react';
import useChartStore from '../../stores/chart-store';

const DataTable = () => {
  const {
    rows,
    seriesConfig,
    addRow,
    removeRow,
    addSeries,
    removeSeries,
    updateRowValue,
    updateSeriesLabel,
    generateChart,
    resetData,
  } = useChartStore();

  // 에디터 전체 높이 조절 상태 (기본값 550px, 최소값 400px)
  const [tableHeight, setTableHeight] = useState(550);
  const minHeight = 400;

  // 마우스 드래그 높이 조절 헬퍼 (document 단위 리스너 및 텍스트 선택 방지 결합)
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = tableHeight;
    
    // 드래그 중 텍스트 선택 방지
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(minHeight, startHeight + deltaY);
      setTableHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.body.style.userSelect = 'auto';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Box 
      sx={{ 
        border: '1px solid rgba(0,0,0,0.08)', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        bgcolor: '#ffffff',
        height: tableHeight, // 전체 에디터 박스에 높이 주입
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 테이블 툴바 헤더 (flex-shrink: 0 으로 높이 고정) */}
      <Box sx={{ p: 2, bgcolor: '#fcfcfd', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, flexShrink: 0 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            차트 데이터 편집기
          </Typography>
          <Typography variant="caption" color="text.secondary">
            * 테이블 셀과 열 이름을 직접 클릭하여 실시간 수정해보세요. (가로 스크롤 시 좌측 열은 고정됩니다.)
          </Typography>
        </Box>
        
        {/* 우측 상단 메인 액션 버튼 그룹 */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Play size={14} />}
            onClick={generateChart}
            sx={{ fontWeight: 700, borderRadius: '8px', px: 2, py: 0.8 }}
          >
            차트 생성 및 반영
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={resetData}
            sx={{ borderRadius: '8px', minWidth: '38px', px: 1, py: 0.8 }}
          >
            <RotateCcw size={14} />
          </Button>
        </Stack>
      </Box>

      {/* 테이블 뷰 영역 (flex-grow: 1 로 남은 높이 전체 차지 및 세로/가로 스크롤 구현) */}
      <TableContainer 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          overflowX: 'auto',
          width: '100%' 
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {/* [틀 고정 1] 행 삭제 컬럼 헤더 (맨 좌측 고정) */}
              <TableCell 
                sx={{ 
                  fontWeight: 700, 
                  width: '60px', 
                  textAlign: 'center', 
                  bgcolor: '#fcfcfd', 
                  zIndex: 4, 
                  position: 'sticky', 
                  left: 0 
                }}
              >
                삭제
              </TableCell>
              
              {/* [틀 고정 2] X축 분류 라벨 컬럼 헤더 (좌측 고정, 삭제 열 너비 60px 오프셋 반영) */}
              <TableCell 
                sx={{ 
                  fontWeight: 700, 
                  minWidth: '150px', 
                  bgcolor: '#fcfcfd', 
                  zIndex: 4, 
                  position: 'sticky', 
                  left: 60 
                }}
              >
                분류 (X축 라벨)
              </TableCell>
              
              {/* 동적 수치 계열 컬럼 헤더들 */}
              {seriesConfig.map((s) => (
                <TableCell key={s.key} sx={{ fontWeight: 700, minWidth: '160px', bgcolor: '#fcfcfd', zIndex: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* 열(계열) 삭제 버튼 - 최소 1개는 유지해야 하며, 계열명 바로 좌측(앞)에 위치 */}
                    {seriesConfig.length > 1 && (
                      <Tooltip title="이 열 삭제">
                        <IconButton 
                          size="small" 
                          onClick={() => removeSeries(s.key)}
                          sx={{ color: 'text.disabled', p: 0.5, '&:hover': { color: 'error.main' } }}
                        >
                          <X size={14} />
                        </IconButton>
                      </Tooltip>
                    )}

                    <TextField
                      value={s.label}
                      onChange={(e) => updateSeriesLabel(s.key, e.target.value)}
                      variant="standard"
                      placeholder="계열명 입력"
                      InputProps={{
                        disableUnderline: true,
                        sx: { 
                          fontWeight: 700, 
                          fontSize: '0.875rem', 
                          color: 'primary.main',
                          '& input': { py: 0.5, px: 0.5, borderRadius: '4px', '&:focus': { bgcolor: 'rgba(0,0,0,0.03)' } } 
                        }
                      }}
                    />
                  </Box>
                </TableCell>
              ))}

              {/* [열(계열) 추가] 컬럼 헤더 - 맨 우측 배치 */}
              <TableCell sx={{ minWidth: '100px', textAlign: 'center', bgcolor: '#fcfcfd', zIndex: 2 }}>
                <Button
                  startIcon={<Plus size={12} />}
                  onClick={addSeries}
                  variant="text"
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  열(계열) 추가
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                {/* [틀 고정 1] 행 삭제 버튼 바디 셀 (맨 좌측 고정) */}
                <TableCell 
                  sx={{ 
                    textAlign: 'center', 
                    position: 'sticky', 
                    left: 0, 
                    bgcolor: '#ffffff', 
                    zIndex: 1 
                  }}
                >
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1} // 데이터 행이 최소 1개는 유지되어야 함
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </TableCell>

                {/* [틀 고정 2] X축 분류 라벨 바디 셀 (좌측 고정, left 60px) */}
                <TableCell 
                  sx={{ 
                    position: 'sticky', 
                    left: 60, 
                    bgcolor: '#ffffff', 
                    zIndex: 1 
                  }}
                >
                  <TextField
                    fullWidth
                    value={row.label}
                    onChange={(e) => updateRowValue(row.id, 'label', e.target.value)}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontSize: '0.9rem', '& input': { py: 0.5 } }
                    }}
                  />
                </TableCell>
                
                {/* 동적 데이터 계열 값들 */}
                {seriesConfig.map((s) => (
                  <TableCell key={s.key}>
                    <TextField
                      fullWidth
                      type="number"
                      value={row[s.key] !== undefined ? row[s.key] : ''}
                      onChange={(e) => updateRowValue(row.id, s.key, e.target.value)}
                      variant="standard"
                      placeholder="0"
                      InputProps={{
                        disableUnderline: true,
                        sx: { fontSize: '0.9rem', fontWeight: 600, '& input': { py: 0.5 } }
                      }}
                    />
                  </TableCell>
                ))}

                {/* 맨 우측 열 추가 컬럼 정렬용 빈 셀 */}
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* 데이터 행 추가 버튼 영역 (flex-shrink: 0 으로 고정 노출 보장) */}
      <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fcfcfd', flexShrink: 0 }}>
        <Button
          startIcon={<Plus size={16} />}
          onClick={addRow}
          variant="text"
          size="small"
          sx={{ fontWeight: 600, borderRadius: '8px' }}
        >
          데이터 행 추가
        </Button>
      </Box>

      {/* [드래그 핸들] 테이블 세로 크기 조절 resizer 바 (flex-shrink: 0) */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          height: '10px',
          bgcolor: '#f1f3f4',
          cursor: 'ns-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          borderTop: '1px solid rgba(0,0,0,0.03)',
          userSelect: 'none',
          flexShrink: 0,
          '&:hover': {
            bgcolor: 'primary.light',
            '& .handle-bar': {
              bgcolor: '#ffffff'
            }
          },
        }}
      >
        <Box 
          className="handle-bar"
          sx={{ 
            width: '40px', 
            height: '4px', 
            bgcolor: 'rgba(0,0,0,0.15)', 
            borderRadius: '2px',
            transition: 'background-color 0.2s'
          }} 
        />
      </Box>
    </Box>
  );
};

export default DataTable;

import React from 'react';
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
import { Plus, Trash2, X, Play, RotateCcw } from 'lucide-react';
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

  return (
    <Box 
      sx={{ 
        border: '1px solid rgba(0,0,0,0.08)', 
        borderRadius: '16px', 
        bgcolor: '#ffffff',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 테이블 툴바 헤더 */}
      <Box sx={{ p: 2, bgcolor: '#fcfcfd', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            차트 데이터 편집기
          </Typography>
          <Typography variant="caption" color="text.secondary">
            * 테이블 셀과 열 이름을 직접 클릭하여 실시간 수정해보세요.
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

      {/* 테이블 뷰 영역 - 높이 고정과 overflow hidden을 걷어내고 자연스러운 높이 확장 보장 */}
      <TableContainer component={Paper} elevation={0} sx={{ width: '100%', borderRadius: 0, maxHeight: 260, overflowY: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {/* 행 삭제 컬럼 헤더 */}
              <TableCell sx={{ fontWeight: 700, width: '60px', textAlign: 'center', bgcolor: '#f1f3f4', position: 'sticky', left: 0, zIndex: 4 }}>
                삭제
              </TableCell>
              
              {/* X축 분류 라벨 컬럼 헤더 */}
              <TableCell sx={{ fontWeight: 700, minWidth: '150px', bgcolor: '#f1f3f4', position: 'sticky', left: 60, zIndex: 4, borderRight: '1px solid rgba(0,0,0,0.08)' }}>
                분류 (X축 라벨)
              </TableCell>
              
              {/* 동적 수치 계열 컬럼 헤더들 */}
              {seriesConfig.map((s) => (
                <TableCell key={s.key} sx={{ fontWeight: 700, minWidth: '160px', bgcolor: '#fcfcfd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* 열(계열) 삭제 버튼 - 최소 1개는 유지 */}
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
                          '& input': { 
                            py: 0.5, 
                            px: 1, 
                            borderRadius: '6px', 
                            transition: 'background-color 0.2s',
                            '&:focus': { 
                              bgcolor: 'rgba(103, 58, 183, 0.08)',
                              boxShadow: 'inset 0 0 0 1px rgba(103, 58, 183, 0.3)'
                            } 
                          } 
                        }
                      }}
                    />
                  </Box>
                </TableCell>
              ))}

              {/* [열(계열) 추가] 컬럼 헤더 */}
              <TableCell sx={{ minWidth: '100px', textAlign: 'center', bgcolor: '#fcfcfd' }}>
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
                {/* 행 삭제 버튼 바디 셀 */}
                <TableCell sx={{ textAlign: 'center', position: 'sticky', left: 0, bgcolor: '#fafafa', zIndex: 1 }}>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1} // 데이터 행이 최소 1개는 유지
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </TableCell>

                {/* X축 분류 라벨 바디 셀 */}
                <TableCell sx={{ position: 'sticky', left: 60, bgcolor: '#fafafa', zIndex: 1, borderRight: '1px solid rgba(0,0,0,0.08)' }}>
                  <TextField
                    fullWidth
                    value={row.label}
                    onChange={(e) => updateRowValue(row.id, 'label', e.target.value)}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: { 
                        fontSize: '0.9rem', 
                        '& input': { 
                          py: 0.5, 
                          px: 1, 
                          borderRadius: '6px', 
                          transition: 'background-color 0.2s',
                          '&:focus': { 
                            bgcolor: 'rgba(103, 58, 183, 0.06)',
                            boxShadow: 'inset 0 0 0 1px rgba(103, 58, 183, 0.2)'
                          } 
                        } 
                      }
                    }}
                  />
                </TableCell>
                
                {/* 동적 데이터 계열 값들 (방안 A: TextField 상시 노출) */}
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
                        sx: { 
                          fontSize: '0.9rem', 
                          fontWeight: 600, 
                          '& input': { 
                            py: 0.5, 
                            px: 1, 
                            borderRadius: '6px', 
                            transition: 'background-color 0.2s',
                            '&:focus': { 
                              bgcolor: 'rgba(103, 58, 183, 0.06)',
                              boxShadow: 'inset 0 0 0 1px rgba(103, 58, 183, 0.2)'
                            } 
                          } 
                        }
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
      
      {/* 데이터 행 추가 버튼 영역 */}
      <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fcfcfd', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
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
    </Box>
  );
};

export default DataTable;

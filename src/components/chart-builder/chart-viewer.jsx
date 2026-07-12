import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  ButtonGroup,
  Stack,
} from '@mui/material';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { Download, BarChart2, LineChart as LineIcon, PieChart as PieIcon, HelpCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import useChartStore from '../../stores/chart-store';

const ChartViewer = () => {
  const {
    chartType,
    setChartType,
    isGenerated,
    renderedRows,
    renderedSeriesConfig,
  } = useChartStore();

  const chartContainerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);

  // 컨테이너 가로폭 변화 감지 및 3px 임계 필터로 무한 리렌더링 차단
  useEffect(() => {
    if (!chartContainerRef.current) return;

    let currentWidth = chartContainerRef.current.clientWidth;
    setChartWidth(currentWidth);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = Math.round(entry.contentRect.width);
        if (Math.abs(newWidth - currentWidth) > 3) {
          currentWidth = newWidth;
          setChartWidth(newWidth);
        }
      }
    });

    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, [isGenerated]);

  // html2canvas를 활용해 차트 영역을 보이는 그대로 이미지로 변환하여 다운로드하는 로직
  const handleExportPng = async () => {
    if (!chartContainerRef.current) return;

    try {
      // 차트 컨테이너 상자 전체를 보이는 그대로 고해상도 Canvas로 캡처
      const canvas = await html2canvas(chartContainerRef.current, {
        scale: 2, // 고해상도 (2배 스케일)
        useCORS: true, // CORS 지원
        backgroundColor: '#ffffff', // 배경을 깔끔한 흰색으로 지정
        logging: false, // 콘솔 디버그 로그 비활성화
      });

      // PNG 이미지로 다운로드 실행
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `chart_${chartType}_export.png`;
      document.body.appendChild(link);
      link.click();
      
      // DOM 정리
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  const renderChart = () => {
    if (renderedRows.length === 0) return null;

    // 공통 범례 스타일 옵션 (상단 중앙 정렬)
    const legendSlotProps = {
      legend: {
        direction: 'row',
        position: { vertical: 'top', horizontal: 'middle' },
        padding: { bottom: 10 }
      }
    };

    // 1. 원형(Pie) 차트
    if (chartType === 'pie') {
      const firstSeriesKey = renderedSeriesConfig[0]?.key || 'seriesA';
      const pieData = renderedRows.map((r, index) => ({
        id: index,
        value: Number(r[firstSeriesKey]) || 0,
        label: r.label,
      }));
      
      return (
        <PieChart
          key={chartType}
          series={[
            {
              data: pieData,
              innerRadius: 30,
              outerRadius: 100,
              paddingAngle: 3,
              cornerRadius: 6,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
            },
          ]}
          width={chartWidth || 500}
          height={350}
          margin={{ top: 50, bottom: 20, left: 20, right: 20 }}
          slotProps={legendSlotProps}
        />
      );
    }

    // 2. 계열(series) 가공
    const series = renderedSeriesConfig.map(s => ({
      dataKey: s.key,
      label: s.label,
    }));

    // 3. 완제품 꺾은선(Line) 차트
    if (chartType === 'line') {
      return (
        <LineChart
          key={chartType}
          dataset={renderedRows}
          xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
          series={series}
          width={chartWidth || 500}
          height={350}
          margin={{ top: 65, bottom: 30, left: 40, right: 20 }}
          slotProps={legendSlotProps}
        />
      );
    }

    // 4. 완제품 막대(Bar) 차트
    if (chartType === 'bar') {
      return (
        <BarChart
          key={chartType}
          dataset={renderedRows}
          xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
          series={series}
          width={chartWidth || 500}
          height={350}
          margin={{ top: 65, bottom: 30, left: 40, right: 20 }}
          slotProps={legendSlotProps}
        />
      );
    }

    return null;
  };

  return (
    <Card 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: '1px solid rgba(0,0,0,0.08)', 
        borderRadius: '16px', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '420px'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2 }}>
        {/* 타이틀 및 차트 종류 토글 컨트롤 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            실시간 차트 미리보기
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              disabled={!isGenerated}
              startIcon={<Download size={14} />}
              onClick={handleExportPng}
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            >
              이미지 저장
            </Button>
            <ButtonGroup size="small" aria-label="chart type button group" color="primary">
              <Button 
                onClick={() => setChartType('line')} 
                variant={chartType === 'line' ? 'contained' : 'outlined'}
                startIcon={<LineIcon size={14} />}
              >
                꺾은선
              </Button>
              <Button 
                onClick={() => setChartType('bar')} 
                variant={chartType === 'bar' ? 'contained' : 'outlined'}
                startIcon={<BarChart2 size={14} />}
              >
                막대
              </Button>
              <Button 
                onClick={() => setChartType('pie')} 
                variant={chartType === 'pie' ? 'contained' : 'outlined'}
                startIcon={<PieIcon size={14} />}
              >
                원형
              </Button>
            </ButtonGroup>
          </Stack>
        </Box>

        {/* 렌더링 본문 영역 */}
        {!isGenerated ? (
          // 플레이스홀더 영역
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, color: 'text.disabled', minHeight: '350px' }}>
            <HelpCircle size={48} strokeWidth={1.5} />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, color: 'text.secondary' }}>
              차트가 아직 생성되지 않았습니다.
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'center', maxWidth: '300px' }}>
              왼쪽 에디터에서 데이터를 기입하고 위저드에 맞춰 "차트 생성 및 반영" 버튼을 눌러주세요.
            </Typography>
          </Box>
        ) : (
          // 차트 렌더링 본체 (차트 너비 감지 상태 주입)
          <Box ref={chartContainerRef} sx={{ width: '100%', height: 375, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.02)', p: 1 }}>
            {renderChart()}
            {chartType === 'pie' && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontStyle: 'italic' }}>
                * 원형(Pie) 차트는 공간 효율 상 첫 번째 계열 데이터 기준으로 시각화됩니다.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default ChartViewer;

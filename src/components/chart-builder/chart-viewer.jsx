import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  ButtonGroup,
  Fade,
} from '@mui/material';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { Download, BarChart2, LineChart as LineIcon, PieChart as PieIcon, HelpCircle } from 'lucide-react';
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
  
  // 실시간 차트 가로폭 측정을 위한 상태
  const [chartWidth, setChartWidth] = useState(0);

  // ResizeObserver를 통해 부모 컨테이너의 실시간 너비 획득 (반응형 대응)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          // padding 간격을 조금 차감해서 안전 크기 지정 (양옆 패딩 총 16px 고려)
          const padding = 16;
          const targetWidth = Math.floor(width - padding);
          
          // 이전 값과 차이가 5px 초과일 때만 상태를 업데이트합니다.
          // 툴팁 말풍선이 오버될 때 일어나는 1~2px 미세 레이아웃 떨림에 의한 리렌더링/툴팁 소멸을 완전 차단합니다.
          setChartWidth(prev => {
            if (Math.abs(prev - targetWidth) > 5) {
              return targetWidth;
            }
            return prev;
          });
        }
      }
    });

    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, [isGenerated]);

  // SVG를 Canvas를 통해 PNG 이미지로 변환하여 다운로드하는 로직
  const handleExportPng = () => {
    if (!chartContainerRef.current) return;

    const svgEl = chartContainerRef.current.querySelector('svg');
    if (!svgEl) {
      alert('차트 이미지 요소를 찾을 수 없습니다.');
      return;
    }

    try {
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgEl);

      // namespace 보정
      if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // 폰트 스타일 및 한글 깨짐 방지 폰트 주입
      const styleTag = `<style>svg { font-family: "Pretendard", "Inter", sans-serif; }</style>`;
      svgString = svgString.replace(/>/, `>${styleTag}`);

      // Blob 및 Object URL 생성
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const objectUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // 고해상도
        const width = svgEl.clientWidth || chartWidth || 500;
        const height = svgEl.clientHeight || 350;

        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        // 하얀색 배경 칠하기
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // PNG 다운로드
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `chart_${chartType}_export.png`;
        document.body.appendChild(link);
        link.click();
        
        // 정리
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;

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
          width={chartWidth || 400}
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
          width={chartWidth || 400}
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
          width={chartWidth || 400}
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
        minHeight: '450px'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2 }}>
        {/* 타이틀 및 차트 종류 토글 컨트롤 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            실시간 차트 미리보기
          </Typography>
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
          // 차트 렌더링 본체
          <Fade in={isGenerated} timeout={400}>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* 차트 드로잉 컨테이너 */}
              <Box ref={chartContainerRef} sx={{ width: '100%', flexGrow: 1, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.02)', p: 1 }}>
                {renderChart()}
                {chartType === 'pie' && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: -2, fontStyle: 'italic' }}>
                    * 원형(Pie) 차트는 공간 효율 상 첫 번째 계열 데이터 기준으로 시각화됩니다.
                  </Typography>
                )}
              </Box>

              {/* 다운로드 버튼 */}
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<Download size={16} />}
                onClick={handleExportPng}
                sx={{ mt: 3, fontWeight: 700, borderRadius: '12px', py: 1 }}
              >
                차트 이미지 저장 (PNG)
              </Button>
            </Box>
          </Fade>
        )}
      </Box>
    </Card>
  );
};

export default ChartViewer;

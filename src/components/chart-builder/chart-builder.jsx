import React from 'react';
import { Box, Typography } from '@mui/material';
import DataTable from './data-table';
import ChartViewer from './chart-viewer';

const ChartBuilder = () => {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* 타이틀 및 헤더 */}
      <Box sx={{ alignSelf: 'flex-start' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
          동적 차트 빌더 📊
        </Typography>
        <Typography variant="body2" color="text.secondary">
          분류와 수치 데이터를 기입하고, 원하는 차트 타입으로 즉시 시각화하여 이미지로 저장해보세요.
        </Typography>
      </Box>

      {/* 상단: 대형 데이터 에디터 테이블 */}
      <DataTable />

      {/* 하단: 대형 차트 뷰포트 및 미리보기 */}
      <ChartViewer />
    </Box>
  );
};

export default ChartBuilder;

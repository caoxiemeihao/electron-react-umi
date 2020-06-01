import React from 'react';
import { Alert } from 'antd';
import styles from './index.less';
import yay from '@/assets/yay.jpg';

export default () => {
  return (
    <div className={styles.page} style={{ backgroundImage: `url(${yay})` }}>
      <Alert message="作者QQ: 308487730" />
    </div>
  );
};

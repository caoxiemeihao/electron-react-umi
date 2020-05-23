import React from 'react';
import styles from './index.less';
import yay from '@/assets/yay.jpg';

export default () => {
  return (
    <div className={styles.page} style={{ backgroundImage: `url(${yay})` }} />
  );
};

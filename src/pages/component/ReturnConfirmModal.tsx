import {Modal, Input, notification} from 'antd';
import React, { useState } from 'react';

const ReturnConfirmModal = (props) => {
  const [inputReason, setInputReason] = useState(props.returnReason);

  const handleReturn = () => {
    if (inputReason.length > 255){
      notification['error']({
        message: '请输入不超过255个字符的原因.',
      })
      return;
    }
    props.handleReturn(inputReason);
    setInputReason('')
  };

  const handleCancel = () => {
    props.handleCancelReturn();
    setInputReason('')
  }

  return (
      <Modal
        title="退回确认"
        centered
        destroyOnClose
        maskClosable={false}
        closable={false}
        visible={props.visible}
        onOk={handleReturn}
        onCancel={handleCancel}
      >
        <p>请输入退回原因:</p>
        <Input value={inputReason} onChange={(e) => setInputReason(e.target.value)} />
      </Modal>
  );
};

export default ReturnConfirmModal;

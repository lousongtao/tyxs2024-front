import {
  Button,
  Form,
  message,
  notification,
  Modal,
  Popconfirm,
  Upload
} from "antd";
import {uploadReccFormApi} from "@/services/ant-design-pro/api";
import React from "react";
import {UploadOutlined} from "@ant-design/icons";

/**
 * 上传推荐表, 这里只包含一个上传控件的form
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const UploadReccFormModal = (props) => {
  const acceptFileType = 'image/jpg,image/jpeg,image/gif,image/png,image/bmp,application/pdf';

  const [form] = Form.useForm();

  /**
   * 上传成功就自动关闭当前modal
   * @param file
   */
  const handleUploadChange = ({ file }) => {
    if (file.status === 'done') {
      notification.success({
        message: '文件上传成功',
        description: '文件名: ' + file.name,
        duration: 0,
      });
      props.onUploadFinish();
    } else if (file.status === 'error'){
      message.error('文件上传错误.');
    }
  };

  const getReccFormFileName = () => {
    if (props.editObj?.reccFormFileUrl){
      const segs = props.editObj.reccFormFileUrl.split('\\');
      return '上次提交文件 ' + segs[segs.length - 1] + ', 再次上传将覆盖此文件.';
    }
    return '';
  }
  return (
      <Modal
        title={'上传推荐表格 - ' + props.modalTitle}
        getContainer={false}
        centered
        destroyOnClose
        maskClosable={false}
        visible={props.visible}
        closable={false}
        footer={[
          <Popconfirm
            key="cancel"
            onConfirm={() => props.onCancel()}
            title='放弃上传么？'>
            <Button key="cancel">
              取消
            </Button>
          </Popconfirm>,
        ]}
        width={400}>
        <div>
          {getReccFormFileName()}
        </div>
        <br/>
        <Upload
          action={uploadReccFormApi + props.objectType + "/" + props.editObj.id}
          headers={{Authorization: 'Basic ' + sessionStorage.getItem('auth')}}
          onChange={handleUploadChange}
          accept={acceptFileType}
        >
          <Button icon={<UploadOutlined />}>上传</Button>
        </Upload>
      </Modal>
  )

}

export default UploadReccFormModal;

import React from 'react';
import { Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {API_UPLOADFILE, deleteTempFile} from "@/services/ant-design-pro/api";

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('请上传图片格式文件(jpg, jpeg, png)');
    }
    return isJpgOrPng;
}

export default class UploadCover extends React.Component {
  constructor(props) {
    super(props);
    //这里采用照片墙的控件, fileList设置为数组, 但是大小限定为1, 避免上传一个图片后会自动添加第二个.
    this.state = {
      previewVisible: false,
      previewImage: '',
      previewTitle: '',
      fileList: []
    };
  }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  //不管上传还是删除文件, 都会触发该事件.
  handleChange = ({ file, fileList }) => {
    console.log('-----------------')
    console.log('file = ' + JSON.stringify(file));
    console.log('fileList = ' + JSON.stringify(fileList));
    if (file.status === 'done') {

    } else if (file.status === 'error'){
      message.error('文件上传错误.');
    } else if (file.status === 'removed'){
      console.log('file.response = ' + file.response)
      deleteTempFile(file.response);
    }

    this.setState({ fileList });
    this.props.changeCover((fileList && fileList.length > 0 )? fileList[0]?.response : null);
  };

  render() {
    const { previewVisible, previewImage, fileList, previewTitle } = this.state;
    const uploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>上传</div>
      </div>
    );
    return (
      <>
        <Upload
          action={API_UPLOADFILE}
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          beforeUpload={beforeUpload}
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </>
    );
  }
}


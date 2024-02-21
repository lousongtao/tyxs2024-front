import {Button, Form, Input, message, Modal, notification, Popconfirm, Select, Spin} from "antd";
import { updateAccountPassword,
} from "@/services/ant-design-pro/api";
import React from "react";

const PasswordModal = (props) => {
  const [form] = Form.useForm();
  const onFinish = async () => {
    try{
      const values = await form.validateFields();
      if (values.errorFields){
        message.error("数据输入不完整");
        return;
      }
    } catch (e) {
      message.error("数据验证失败");
      return;
    }
    const password = form.getFieldValue('password');
    setLoadData(true);//这个要在payload构造之后, 否则改动state会引起effect, 进而form值会更改为最初的值
    try{
      await updateAccountPassword(props.editPasswordAccount.id, password);
      setLoadData(false);
      message.success("密码修改成功");
      form.resetFields();
      props.onSaveFinish();
    } catch (error) {
      setLoadData(false);
      notification['error']({
        message: '密码修改失败.',
        description: error?.info?.message
      })
    }
  };
  const [loadData, setLoadData] = React.useState(false);//页面加载时启动等待框, 加载数据

  const buildForm = () => {
    return (
      <Form
        style={{margin: 7}}
        labelCol={{span: 6}}
        wrapperCol={{span: 14}}
        title={props.editPasswordAccount.name + ' - 修改密码'}
        form={form}
        scrollToFirstError>
        <Form.Item name="password" label="新密码"
                   rules={[{required: true,message: '请输入新密码'}]}>
          <Input.Password style={{width:200}}/>
        </Form.Item>
      </Form>
    )
  }
  /**
   * 点击Cancel关闭Modal,
   */
  const handleCancel = () => {
    props.onCancel();
  }

  return (
    <Spin spinning={loadData}>
      <Modal
        title={'修改密码 - ' + props.editPasswordAccount.name}
        getContainer={false}
        centered
        destroyOnClose
        maskClosable={false}
        visible={props.visible}
        closable={false}
        footer={[
          <Popconfirm
            key="cancel"
            onConfirm={() => handleCancel()}
            title='确认放弃修改密码？'>
            <Button key="cancel">
              取消
            </Button>
          </Popconfirm>,
          <Popconfirm
            key="submit"
            onConfirm={() => onFinish(1)}
            title='确认修改该帐户密码？'>
            <Button key="submit" type="primary">
              确定
            </Button>
          </Popconfirm>
        ]}
        width={600}>
        {buildForm()}
      </Modal>
    </Spin>
  )

}

export default PasswordModal;

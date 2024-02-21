/**
 * 这个类用来创建/修改 申报单位 帐户
 */
import {Button, Form, Input, message, Modal, Popconfirm, Spin, notification, Radio, Space} from "antd";
import {
  addAccount,
  updateAccount,
} from "@/services/ant-design-pro/api";
import React, {useEffect} from "react";
import {useModel} from "umi";

const SBDWAccountModal = (props) => {

  const [form] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');
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
    const payload = {
      ...form.getFieldsValue(),
    }
    if (!editAccount.id && payload.password !== payload.repeatPassword){
      message.error("两次输入密码不一致");
      return;
    }

    console.log('payload = ' + JSON.stringify(payload));
    setLoadData(true);//这个要在payload构造之后, 否则改动state会引起effect, 进而form值会更改为最初的值
    try{
      let account = null;
      if (editAccount.id){
        payload.id = editAccount.id;
        account = await updateAccount(payload);
      } else {
        account = await addAccount(payload);
      }
      setLoadData(false);
      if (account){
        //提交成功后要把数据都清空
        message.success("数据提交成功");
        form.resetFields();
        props.onSaveFinish();
      } else {
        notification['error']({
          message: '保存帐号出错.....'
        })
      }
    } catch (error) {
      setLoadData(false);
      notification['error']({
        message: '保存帐号出错.',
        description: error?.info?.message
      })
    }
  };
  const [editAccount, setEditAccount] = React.useState({}); //记录当前编辑对象, 对于Add的界面, 是个空对象.
  const [loadData, setLoadData] = React.useState(false);//页面加载时启动等待框, 加载数据
  const [commitType, setCommitType] = React.useState();
  //只有在新建界面显示密码项
  const getPassword = () => {
    if (editAccount?.id) return <></>; //编辑状态下不显示重复输入密码
    return (
      <>
        <Form.Item name="password" label="密码"
                   rules={[{required: true,message: '请输入密码'}]}>
          <Input.Password style={{width:200}}/>
        </Form.Item>
        <Form.Item name="repeatPassword" label="重输密码"
                   rules={[{required: true,message: '请输入密码'}]}>
          <Input.Password style={{width:200}}/>
        </Form.Item>
      </>
    )
  }

  //推荐账号创建申报账号时, 要选择申报账号能够提交的类型, 包括4个可选项"brand", "mgmt", "people", "works"
  const getCommitTypeItem = () => {
    //如果是修改状态, 且修改的是自身, 不要显示permission字段;
    //如果是修改状态, 且修改的是子帐户, 这个字段可以修改
    //如果是新建状态(editAccount=={}), 显示permission.
    if (!editAccount.id || editAccount.id != initialState.currentUser.userid){
      return (
        <Form.Item name="permission" label="申报类型" rules={[{required: true,message: '请选择申报类型'}]}>
          <Radio.Group onChange={(e) => setCommitType(e.target.value)} value={commitType}>
            <Space>
              <Radio value="brand">科普品牌</Radio>
              <Radio value="mgmtorg">科普管理(机构)</Radio>
              <Radio value="mgmtindividual">科普管理(个人)</Radio>
              <Radio value="works">科普作品</Radio>
              <Radio value="people">科普人物</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      )
    }
  }

  useEffect(() => {
    if (props.editAccount !== editAccount){
      //要先把form清空, 再重新设置新的值, 否则当add的时候, 传入空对象, 无法覆盖之前的显示
      form.resetFields();
      form.setFieldsValue(props.editAccount);
      setEditAccount(props.editAccount);
    }
  } );

  const buildForm = () => {
    return (
      <Form
        style={{margin: 7}}
        labelCol={{span: 6}}
        wrapperCol={{span: 14}}
        form={form}
        scrollToFirstError>
        <Form.Item
          name="name"
          label='单位名称'
          rules={[{required: true,message: '请输入单位名称',whitespace: true}]}>
          <Input style={{width:400}} />
        </Form.Item>
        <Form.Item
          name="account"
          label="帐号"
          extra='仅限使用字母数字. 请勿输入中文字符.'
          rules={[
            {required: true,message: '请输入帐号',whitespace: true},
            {pattern: /^[a-zA-Z0-9-_\.]+$/, message: '仅限使用字母数字. 请勿输入中文字符.'}
          ]}>
          <Input style={{width:200}} disabled={initialState.currentUser?.type === 3}/>
        </Form.Item>
        {getPassword()}
        {getCommitTypeItem()}
        <Form.Item
          name="phone"
          extra='电话号码请输入8-11位数字'
          rules={[{required: true, pattern: '^[0-9]{8,11}$', message: '电话号码格式不正确'}]}
          label='电话'>
          <Input style={{width:400}}/>
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
        title={props.modalTitle}
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
            title='确认放弃已编辑过的内容么？'>
            <Button key="cancel">
              取消
            </Button>
          </Popconfirm>,
          <Popconfirm
            key="submit"
            onConfirm={() => onFinish(1)}
            title='确认提交该用户数据？'>
            <Button key="submit" type="primary">
              确定
            </Button>
          </Popconfirm>
        ]}
        width={800}>
        {buildForm()}
      </Modal>
    </Spin>
  )

}


export default SBDWAccountModal;

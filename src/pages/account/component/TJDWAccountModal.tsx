/**
 * 这个类用来创建/修改 推荐单位 帐户
 */
import {Button, Form, Input, message, Modal, Popconfirm, Select, Spin, notification, InputNumber} from "antd";
import {
  addAccount, getOrgTypes,
  updateAccount,
} from "@/services/ant-design-pro/api";
import React, {useEffect} from "react";
import {useModel} from "umi";

const TJDWAccountModal = (props) => {

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
  const [orgTypes, setOrgTypes] = React.useState([]);//机构类型
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

  useEffect(() => {
    if (props.editAccount !== editAccount){
      //要先把form清空, 再重新设置新的值, 否则当add的时候, 传入空对象, 无法覆盖之前的显示
      form.resetFields();
      form.setFieldsValue(props.editAccount);
      setEditAccount(props.editAccount);
    }
  } );

  useEffect(() => {
    const fetchData = async () => {
      const orgTypes = await getOrgTypes();
      setOrgTypes(orgTypes);
    }
    fetchData();
  }, []);

  const buildForm = () => {
    return (
      <Form
        style={{margin: 7}}
        labelCol={{span: 6}}
        wrapperCol={{span: 14}}
        form={form}
        initialValues={{quantityPeople: 2, quantityWorks: 3, quantityMgmtOrg: 1, quantityMgmtIndividual: 1, quantityBrand: 1, orgTypeId: 10}}
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
            {pattern: /^[a-zA-Z0-9-_\.]+$/, message: '仅限使用字母数字及(- _ .). 请勿输入中文字符.'}
          ]}>
          <Input style={{width:200}} disabled={initialState.currentUser?.type === 3}/>
        </Form.Item>
        {getPassword()}
        <Form.Item name="orgTypeId" label="机构类型" rules={[{required: true,message: '请输入机构类型'}]}>
          <Select style={{width:200}}>
            {orgTypes.map(ot => <Select.Option value={ot.id} key={ot.id}>{ot.name}</Select.Option> )}
          </Select>
        </Form.Item>
        <Form.Item name="contactPerson" label="联系人" rules={[{required: true,message: '请输入联系人',whitespace: true}]}>
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{required: true,message: '请输入邮箱',whitespace: true}]}>
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item
          name="phone"
          extra='电话号码请输入8-11位数字'
          rules={[{required: true, pattern: '^[0-9]{8,11}$', message: '电话号码格式不正确'}]}
          label='电话'>
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item
          name="quantityBrand"
          rules={[{required: true,message: '请输入数量'}]}
          hidden={initialState?.currentUser?.type != 1}
          label='申报科普品牌数量'>
          <InputNumber min={1} max={2} />
        </Form.Item>
        <Form.Item
          name="quantityMgmtIndividual"
          rules={[{required: true,message: '请输入数量'}]}
          hidden={initialState?.currentUser?.type != 1}
          label='申报科普管理(个人)数量'>
          <InputNumber min={1} max={2} />
        </Form.Item>
        <Form.Item
          name="quantityMgmtOrg"
          rules={[{required: true,message: '请输入数量'}]}
          hidden={initialState?.currentUser?.type != 1}
          label='申报科普管理(机构)数量'>
          <InputNumber min={1} max={2} />
        </Form.Item>
        <Form.Item
          name="quantityWorks"
          rules={[{required: true,message: '请输入数量'}]}
          hidden={initialState?.currentUser?.type != 1}
          label='申报科普作品数量'>
          <InputNumber min={1} max={20} />
        </Form.Item>
        <Form.Item
          name="quantityPeople"
          rules={[{required: true,message: '请输入数量'}]}
          hidden={initialState?.currentUser?.type != 1}
          label='申报科普人物数量'>
          <InputNumber min={1} max={4}/>
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

export default TJDWAccountModal;

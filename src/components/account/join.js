import React, { useState, useReducer, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Header from '../header/header';
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Link from '@material-ui/core/Link';
import HeaderDividers from './divider';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import VericationCodeApp from './verication_code';
import JoinReducer from './joinReducer';
import { SubmitJoinForm, RequestData } from './submit'

const useStyles = makeStyles((theme) => ({
  marginTop: {
    marginTop: theme.spacing(14)
  },
  inputOuter: {
    marginTop: theme.spacing(3),
  },
  formControl: {
    margin: theme.spacing(0),
  },
  inputEndAdornment: {
    minWidth: '11ch'
  },
  codeInputEndAdornment: {
    minWidth: '11ch'
  },
  primaryColor: {
    color: "#2196F3",
  },
  secondaryColor: {
    color: "#FE6B8B",
  },
  root: {
    '&$error': {
      color: 'red'
    }
  },
  error: {}
}));

export default function Join(props) {
  const classes = useStyles();
  let history = useHistory();

  // 注册表单数据
  const [joinData, setValues] = useState({
    nickname: { value: '', errMsg: '', show: true },
    password: { value: '', errMsg: '', show: false },
    area_code: { value: '', errMsg: '', show: true },
    phone: { value: '', errMsg: '', show: true },
    verification_code: { value: '', errMsg: '', show: true },
  });

  // 表单验证数据
  const [paramsErrMsg, setParamsErrMsg] = useState({
    nickname: { errMsg: '', show: false, valid: false },
    password: { errMsg: '', show: false, valid: false },
    area_code: { errMsg: '', show: false, valid: false },
    phone: { errMsg: '', show: false, valid: false },
    verification_code: { errMsg: '', show: false, valid: false },
  })

  // 登陆结果
  const [joinResult, setJointResult] = useState({
    isLoading: false,
    result: {},
  });

  // 获取表单校验正则
  const [regexps, setRegexps] = useState({
    succeed: false,
    result: {},
  });
  const getRegexpsCallback = (data) => {
    setRegexps(data);
  }
  useEffect(() => {
    RequestData('login/regexp', getRegexpsCallback)
  }, []);


  // 获取区号
  const [areaCodeList, setAreaCodeList] = useState({
    succeed: false,
    result: {},
  });
  const getAreaCodeListCallback = (data) => {
    setAreaCodeList(data);
  }
  useEffect(() => {
    RequestData('country/list', getAreaCodeListCallback)
  }, []);


  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    if (joinResult.result && joinResult.result.succeed) {
      sleep(3000);
      history.push('/login');
    }

  }, [history, joinResult]);


  const [currentEdit, setCurrentEdit] = useState("");
  // 表单字段变更
  const handleChange = (prop) => (event) => {
    setCurrentEdit(prop);

    setValues({ ...joinData, [prop]: { ...joinData[prop], value: event.target.value } });
    dispatch({ type: 'CHANGE_DATA', prop: prop, value: event.target.value })
  };

  const [currentOnBlurField, setCurrentOnBlurField] = useState("");
  const onBlurField = (prop) => (event) => {
    setCurrentOnBlurField(prop);
  }

  useEffect(() => {
    ValidPropByRegexpsOnBlur(currentEdit)
  }, [joinData, currentEdit, currentOnBlurField]);

  const ValidPropByRegexpsOnBlur = (prop) => {
    if (currentOnBlurField != prop) {
      return
    }

    ValidPropByRegexps(prop);
  }

  const ValidPropByRegexps = (prop) => {
    if (!regexps || !regexps.result) {
      return true
    }

    let regexpMap = Object.create({});
    for (let i = 0; i < regexps.result.length; i++) {
      regexpMap[regexps.result[i].name] = regexps.result[i];
    };

    if (regexpMap[prop]) {
      let match = joinData[prop].value.match(regexpMap[prop].rules);
      if (match) {
        setParamsErrMsg({ ...paramsErrMsg, [prop]: { errMsg: '', show: false, valid: true } });
        return true
      } else {
        setParamsErrMsg({ ...paramsErrMsg, [prop]: { errMsg: regexpMap[prop].desc, show: true, valid: false } });
        return false
      }
    }

    return true
  };

  const handleClickShowPassword = () => {
    setValues({ ...joinData, password: { ...joinData.password, show: !joinData.password.show } });
  };

  // @ts-ignore
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const [state, dispatch] = useReducer(JoinReducer, joinData);

  const callback = (resp) => {
    setJointResult({ isLoading: false, result: resp });
  }

  // @ts-ignore
  const handleJoinSubmit = (event) => {
    event.preventDefault();
    if (!ValidPropByRegexpsOnSubmitForm()) {
      return
    }

    SubmitJoinForm(state, callback);
  };

  const ValidPropByRegexpsOnSubmitForm = () => {
    let keys = ['nickname', 'password', 'area_code', 'phone', 'verification_code']

    for (let key of keys) {
      if (!ValidPropByRegexps(key)) {
        return false;
      }
    }

    return true;
  }

  return (
    <React.Fragment>
      <Header />
      {/* 分割线 */}
      <Grid container className={classes.marginTop}>
        <Grid item xs={3}>
        </Grid>
        <Grid item xs={6}>
          <HeaderDividers name="注册" />
        </Grid>
        <Grid item xs={3}>
        </Grid>
      </Grid>

      {/* 注册表单 */}
      <Grid container>
        <Grid item xs={4}></Grid>
        <Grid item xs={4}>
          <Grid className={classes.inputOuter} item xs={12}>
            <TextField fullWidth id="standard-required" label="昵称"
              value={joinData.nickname.value}
              onChange={handleChange('nickname')}
              onBlur={onBlurField('nickname')}
              error={paramsErrMsg['nickname'].show}
              helperText={paramsErrMsg['nickname'].show && paramsErrMsg['nickname'].errMsg}
            />
          </Grid>

          <Grid className={classes.inputOuter} item xs={12}>
            <FormControl fullWidth>
              <TextField
                label="密码"
                id="standard-adornment-password"
                type={joinData.password.show ? 'text' : 'password'}
                error={paramsErrMsg['password'].show}
                value={joinData.password.value}
                onBlur={onBlurField('password')}
                onChange={handleChange('password')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {joinData.password.show ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }}
                helperText={paramsErrMsg['password'].show && paramsErrMsg['password'].errMsg}
              />
            </FormControl>
          </Grid>

          <Grid container className={classes.inputOuter} spacing={0} item>
            <Grid item xs={4}>
              <FormControl fullWidth className={classes.formControl} error={paramsErrMsg['area_code'].show}>
                <InputLabel id="demo-simple-select-label">区号</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={joinData.area_code.value}
                  onChange={handleChange('area_code')}
                >
                  {/* 区号列表 */}
                  {!areaCodeList.succeed ? (
                    <div>Loading ...</div>
                    // @ts-ignore
                  ) : (areaCodeList.result.map(item => (
                    <MenuItem key={item.cname} value={item.country_code}>{item.cname}</MenuItem>
                  )))}
                </Select>
                <FormHelperText>{paramsErrMsg['area_code'].errMsg}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                id="standard-required"
                label="手机号"
                onChange={handleChange('phone')}
                onBlur={onBlurField('phone')}
                error={paramsErrMsg['phone'].show}
                helperText={paramsErrMsg['phone'].show && paramsErrMsg['phone'].errMsg}
              />
            </Grid>
          </Grid>

          <Grid className={classes.inputOuter}>
            <FormControl fullWidth>
              {/* <InputLabel ></InputLabel> */}
              <TextField
                label="验证码"
                type="text"
                className={classes.codeInputEndAdornment}
                value={joinData.verification_code.value}
                onChange={handleChange('verification_code')}
                onBlur={onBlurField('verification_code')}
                InputProps={{
                  endAdornment: <VericationCodeApp />
                }}
                error={paramsErrMsg['verification_code'].show}
                helperText={paramsErrMsg['verification_code'].show && paramsErrMsg['verification_code'].errMsg}
              />
            </FormControl>
          </Grid>

          <Grid className={classes.inputOuter} container>
            <Grid item xs={6} className={joinResult.result && joinResult.result.succeed ? classes.primaryColor : classes.secondaryColor} >
              {joinResult.result && joinResult.result.succeed && "注册成功"}
              {joinResult.result && !joinResult.result.succeed && joinResult.result.error_info && String(joinResult.result.error_info.message)}
            </Grid>
          </Grid>

          <Grid
            className={classes.inputOuter}
            container
          >
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleJoinSubmit}
              disableElevation
            >
              注册
            </Button>
          </Grid>

          <Grid container
            className={classes.inputOuter}
            direction="row"
            justify="flex-end"
            alignItems="center"
          >
            <Link
              component={RouterLink}
              to="/login"
            >
              已有账号，直接登录
            </Link>
          </Grid>
        </Grid>
        <Grid item xs={4}>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
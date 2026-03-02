/**
 * 方案评估通行证：本地生成、本地校验，一码一次，不依赖任何外部服务。
 * 主站与客服页共用一个密钥，仅校验通过才可进入下一界面。
 */
(function(global){
  var SECRET = 'xiangtai_eval_pass_2024';
  function hash3(str){
    var n = 0, i;
    for (i = 0; i < str.length; i++) n = ((n * 31) + str.charCodeAt(i)) >>> 0;
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var r = '';
    for (i = 0; i < 3; i++) { n = (n * 1103515245 + 12345) >>> 0; r += a.charAt(n % a.length); }
    return r;
  }
  function dateStr(){
    var d = new Date();
    return d.getFullYear() + String(100 + (d.getMonth()+1)).slice(1) + String(100 + d.getDate()).slice(1);
  }
  /** 生成一个通行证（客服页调用） */
  function generate(){
    var date = dateStr();
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var payload = '';
    for (var i = 0; i < 3; i++) payload += a.charAt(Math.floor(Math.random() * a.length));
    var sig = hash3(SECRET + date + payload);
    return 'XT' + date + payload + sig;
  }
  /** 校验通行证是否合法（主站调用），不检查是否已使用 */
  function verify(code){
    if (!code || typeof code !== 'string') return false;
    code = code.trim().toUpperCase();
    if (code.length !== 16 || code.indexOf('XT') !== 0) return false;
    var date = code.slice(2, 10);
    var payload = code.slice(10, 13);
    var sig = code.slice(13, 16);
    return hash3(SECRET + date + payload) === sig;
  }
  /** 后台登录账号与密码（客服工作台入口），可自行修改 */
  global.XiangtaiEvalPass = {
    generate: generate,
    verify: verify,
    ADMIN_USER: 'admin',
    ADMIN_PASS: 'Xiangtai2024'
  };
})(typeof window !== 'undefined' ? window : this);

/** 选择文件 */
export function chooseFile(accept = ''): Promise<[boolean | null, File]> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (ev: any) => resolve([null, ev.target.files[0]]);
    input.click();
  });
}

/**
 * 复制内容到剪切板
 * @param txt 复制内容
 */
export function copyToClipboard(txt = '') {
  const input = document.createElement('input');
  input.style.cssText += `position:absolute;top:0;left:0;height:0;overflow:hidden;z-index:-1;`;
  document.body.appendChild(input);
  input.value = txt;
  input.select();
  const bool = document.execCommand('copy');
  document.body.removeChild(input);
  return bool;
}

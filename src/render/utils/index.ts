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

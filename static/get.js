const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay)); // custom sleep func (only can use in async function with await)

function sliceText(text, maxLength) {
    // better slice()
    if (maxLength == 0) { // disabled
        return text;
    } else if (text.length <= maxLength) { // shorter than maxLength
        return text;
    }
    return text.slice(0, maxLength) + '...';
}

async function update() {
    let refresh_time = 5000;
    let routerIndex = window.location.href.indexOf('?');
    let url = window.location.href.slice(0, routerIndex > 0 ? routerIndex : window.location.href.length);
    while (true) {
        if (document.visibilityState == 'visible') {
            console.log('tab visible, updating...');
            let success_flag = true;
            let errorinfo = '';
            const statusElement = document.getElementById('status');
            // --- show updating
            statusElement.textContent = '[更新中...]';
            document.getElementById('additional-info').innerHTML = '正在更新状态, 请稍候...<br/>\n长时间无反应? 试试 <a href="javascript:location.reload();" target="_self" style="color: rgb(0,149,255);">刷新页面</a>';
            last_status = statusElement.classList.item(0);
            statusElement.classList.remove(last_status);
            statusElement.classList.add('sleeping');
            document.getElementById('device-status').textContent = 'ヾ(≧▽≦*)o 更新设备状态中...';
            // fetch data
            fetch(url + 'query', { timeout: 10000 })
                .then(response => response.json())
                .then(async (data) => {
                    console.log(data);
                    if (data.success) {
                        // update status (status, additional-info)
                        statusElement.textContent = data.info.name;
                        document.getElementById('additional-info').innerHTML = data.info.desc;
                        last_status = statusElement.classList.item(0);
                        statusElement.classList.remove(last_status);
                        statusElement.classList.add(data.info.color);

                        // update device status (device-status)
                        var deviceStatus = '<h2>设备状态</h2>';
                        const devices = Object.values(data.device);
                        for (let device of devices) {
                            console.log(device);

                            // 决定设备状态显示
                            if (device.using) {
                                // replace "xxx" with 'xxx'
                                var device_app_title = device.app_name.replace('"', '\\"').replace('\'', '\\\'');
                                var device_show_name = device.show_name.replace('"', '\\"').replace('\'', '\\\'');
                                var device_app_alert = device.app_name.replace('"', '\\"').replace('\'', '\\\'');
                                // build
                                var device_app = `<a class="device-status-using" style="font-size: 18px;" title="${device_app_title}" href="javascript:alert('${device_show_name}: ${device_app_alert}')">${sliceText(device.app_name, data.device_status_slice)}</a>`;
                            } else {
                                var device_app = '<a class="device-status-unused" style="font-size: 18px;" >未在使用</a>';
                            }
                            deviceStatus += `<div class="setting-card"> <div class="left"><h3>${device.show_name}</h3></div><div class="right">${device_app}</div> </div>`;  // 设备卡片（设备名称+设备状态）
                        }
                        if (deviceStatus == '<h2>设备状态</h2>') { // 没有发现设备
                            deviceStatus = '';
                        }

                        document.getElementById('device-status').innerHTML = deviceStatus;  // 更新设备状态
                        // update last update time (last-updated)
                        document.getElementById('last-updated').textContent = data.last_updated;  // 更新最后更新时间
                        // update refresh time
                        refresh_time = data.refresh;
                    } else {
                        errorinfo = data.info;
                        success_flag = false;
                    }
                })
                .catch(error => {
                    errorinfo = error;
                    success_flag = false;
                });
            // update error
            if (!success_flag) {
                statusElement.textContent = '[!错误!]';
                document.getElementById('additional-info').textContent = errorinfo;
                last_status = statusElement.classList.item(0);
                statusElement.classList.remove(last_status);
                statusElement.classList.add('error');
            }
        } else {
            console.log('tab not visible, skip update');
        }

        await sleep(refresh_time);
    }
}

update();
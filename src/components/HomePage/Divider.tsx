"use client";

import React, { memo } from "react";

// 状态指示器组件
const Divider = memo(() => (
    <span className="text-gray-300 flex items-center">|</span>
));

Divider.displayName = 'Divider';

export default Divider;
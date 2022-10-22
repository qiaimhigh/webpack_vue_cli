<script setup>

</script>
<template>
    <h1 class="title">Hello App</h1>
    <el-button type="primary">按钮</el-button>
    <el-button type="success">安吉</el-button>
    <ul>
        <li><router-link to="/">home</router-link></li>
        <li><router-link to="/about">About</router-link></li>  
    </ul>
    <router-view></router-view>
</template>
<style >
.title{
    color: red;
}
</style>
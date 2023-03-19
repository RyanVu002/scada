<!-- eslint-disable no-mixed-spaces-and-tabs -->
<template>
	<div id="app">
		<div class="view login" v-if="state.username === '' || state.username === null">
			<form class="login-form"  @submit.prevent="Login">
				<div class="form-inner">
				<h1>Login to SCADA data live data</h1>
				<label for="username">Username</label>
				<input 
					type="text" 
					v-model="inputUsername" 
					placeholder="Please enter your username..." />
				<input 
					type="submit" 
					value="Login" />
				</div>
			</form>
		</div>
  
		<div class="view chat" v-else>
			<header>
				<div class="d-flex justify-content-between">
					<h1>Welcome, {{ state.username }}</h1>
					<button type="button" class="btn btn-danger float-right" @click="Logout">Logout</button>
				</div>
			</header>
			
			<section class="chat-box">
				<div class="row">
					<div class="col-2 vstack gap-3 p-3">
						<h3>Pump</h3>
						<button class="btn" :class="{ 'btn-success': state.status, 'btn-outline-success': !state.status}" @click="SetStatus">Sensor #1 {{ state.status ? 'ON' : 'OFF' }}</button>
						<button class="btn" :class="{ 'btn-success': state.status, 'btn-outline-success': !state.status}" @click="SetStatus">Sensor #2 {{ state.status ? 'ON' : 'OFF' }}</button>
						<button class="btn" :class="{ 'btn-success': state.status, 'btn-outline-success': !state.status}" @click="SetStatus">Sensor #3 {{ state.status ? 'ON' : 'OFF' }}</button>
						<button class="btn" :class="{ 'btn-success': state.status, 'btn-outline-success': !state.status}" @click="SetStatus">Sensor #4 {{ state.status ? 'ON' : 'OFF' }}</button>
					</div>
					<div class="col-2 vstack gap-3 p-3">
						<h3>Release</h3>
						<button class="btn" :class="{ 'btn-success': state.status, 'btn-outline-success': !state.status}" @click="SetStatus">Sensor #1 {{ state.status ? 'ON' : 'OFF' }}</button>
						<button class="btn" :class="{ 'btn-success': state.status, 'btn-outline-success': !state.status}" @click="SetStatus">Sensor #2 {{ state.status ? 'ON' : 'OFF' }}</button>
						<button class="btn" :class="{ 'btn-success': state.status, 'btn-outline-success': !state.status}" @click="SetStatus">Sensor #3 {{ state.status ? 'ON' : 'OFF' }}</button>
						<button class="btn" :class="{ 'btn-success': state.status, 'btn-outline-success': !state.status}" @click="SetStatus">Sensor #4 {{ state.status ? 'ON' : 'OFF' }}</button>
					</div>
					<div class="col-4 p-3 d-flex justify-content-center">
						<div>
							<h3 class="d-flex justify-content-center">Power</h3>
							<vue-gauge :refid="'type-unique-id-1'" :options="gaugeOptions" :key="gaugeValue"></vue-gauge>
						</div>
						<div>
							<h3 class="d-flex justify-content-center">Tank</h3>
							<vue-gauge :refid="'type-unique-id-2'" :options="gaugeOptions" :key="gaugeValue"></vue-gauge>
						</div>
					</div>
					<div class="col-4">
						<h3 class="d-flex justify-content-center">Back log</h3>
						<div class="chat-box">
							<div 
								v-for="message in historyData" 
								:key="message.key"
								class="message current-user">
								<div class="message-inner">
									<div class="username">{{ message.username }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="chat-box">
				<div 
					v-for="message in state.messages" 
					:key="message.key" 
					:class="(message.username == state.username ? 'message current-user' : 'message')">
					<div class="message-inner">
						<div class="username">{{ message.username }}</div>
						<div class="content">{{ message.content }}</div>
					</div>
				</div>
			</section>
		
			<footer>
				<form @submit.prevent="SendMessage">
				<input 
					type="text" 
					v-model="inputMessage" 
					placeholder="Write a message..." />
				<input 
					type="submit" 
					value="Send" />
				</form>
			</footer>
		</div>
	</div>
</template>

<script>
import { reactive, onMounted, ref } from 'vue';
import db from './db';
import VueGauge from 'vue-gauge';

export default {
	components: { VueGauge },
	data() {
		return {
			gaugeValue: 0
		}
	},
	computed: {
		gaugeOptions() {
			return {
				hasNeedle: true,
				needleValue: this.gaugeValue,
				needleColor: 'black',
				arcColors: [
				'rgb(61, 204, 91)',
				'rgb(239, 214, 19)',
				'rgb(255,165,0)',
				'rgb(255, 84, 84)',
				],
				arcDelimiters: [25, 50, 75],
				rangeLabel: ['0', '100'],
				arcOverEffect: false,
				needleStartValue: this.gaugeValue,
				centralLabel: this.gaugeValue.toString(),
			}
		},
		historyData() {
			return this.state.messages.slice(1).slice(-5);
		}
	},
	setup() {
		const inputUsername = ref("");
		const inputMessage = ref("");

		const state = reactive({
		username: "",
		messages: [],
		status: false
		});

		const Login = () => {
		if (inputUsername.value != "" || inputUsername.value != null) {
			state.username = inputUsername.value;
			inputUsername.value = "";
			statusLoad();
		}
		}

		const Logout = () => {
		state.username = "";
		}

		const SetStatus = () => {
		state.status = !state.status;
		const statusRef = db.database().ref("status");

		const userStatus = {
			username: state.username,
			status: state.status
		}

		statusRef.push(userStatus);
		}

		const SendMessage = () => {
		const messagesRef = db.database().ref("messages");

		if (inputMessage.value === "" || inputMessage.value === null) {
			return;
		}

		const message = {
			username: state.username,
			content: inputMessage.value
		}

		messagesRef.push(message);
		inputMessage.value = "";
		}

		onMounted(() => {
		const messagesRef = db.database().ref("messages");
		messagesRef.on('value', snapshot => {
			const data = snapshot.val() ?? "";
			let messages = [];
			Object.keys(data).forEach(key => {
			messages.push({
				id: key,
				username: data[key].username,
				content: data[key].content
			});
			});
			state.messages = messages;
		});
		});

		const statusLoad = () => { 
		const statusRef = db.database().ref("status");
		statusRef.on('value', snapshot => {
			const data = snapshot.val() ?? "";
			let status = [];
			Object.keys(data).forEach(key => {
			status.push({
				id: key,
				status: data[key].status
			});
			});

			const finalStatus = status.pop();
			state.status = finalStatus ? finalStatus.status : false;
		});
		}

		return {
		inputUsername,
		Login,
		state,
		inputMessage,
		SendMessage,
		Logout,
		SetStatus
		}
	}
}
</script>

<style lang="scss">
	* {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;

		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.view {
		display: flex;
		justify-content: center;
		min-height: 100vh;
		background-color: #6c757d ;
		
		&.login {
			align-items: center;
			.login-form {
				display: block;
				width: 100%;
				padding: 15px;
				
				.form-inner {
					display: block;
					background-color: #FFF;
					padding: 50px 15px;
					border-radius: 16px;
					box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);

					h1 {
						color: #AAA;
						font-size: 28px;
						margin-bottom: 30px;
					}

					label {
						display: block;
						margin-bottom: 5px;
						color: #AAA;
						font-size: 16px;
						transition: 0.4s;
					}

					input[type="text"] {
						appearance: none;
						border: none;
						outline: none;
						background: none;

						display: block;
						width: 100%;
						padding: 10px 15px;
						border-radius: 8px;
						margin-bottom: 15px;
						
						color: #333;
						font-size: 18px;

						box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
						background-color: #F3F3F3;

						transition: 0.4s;

						&::placeholder {
							color: #888;
							transition: 0.4s;
						}
					}

					input[type="submit"] {
						appearance: none;
						border: none;
						outline: none;
						background: none;

						display: block;
						width: 100%;
						padding: 10px 15px;
						background-color: #ea526f;
						border-radius: 8px;

						color: #FFF;
						font-size: 18px;
						font-weight: 700;
					}

					&:focus-within {
						label {
							color: #ea526f;
						}

						input[type="text"] {
							background-color: #FFF;
							box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);

							&::placeholder {
								color: #666;
							}
						}
					}
				}
			}
		}

		&.chat {
			flex-direction: column;

			header {
				position: relative;
				display: block;
				width: 100%;
				padding: 50px 30px 10px;

				.logout {
					position: absolute;
					top: 15px;
					right: 15px;
					appearance: none;
					border: none;
					outline: none;
					background: none;
					
					color: #FFF;
					font-size: 18px;
					margin-bottom: 10px;
					text-align: right;
				}

				h1 {
					color: #FFF;
				}
			}

			.chat-box {
				border-radius: 24px;
				background-color: #FFF;
				box-shadow: 0px 0px 12px rgba(100, 100, 100, 0.2);
				flex: 1 1 100%;
				padding: 30px;
				margin: 30px;
				.message {
					display: flex;
					margin-bottom: 15px;
					
					.message-inner {
						.username {
							color: #888;
							font-size: 16px;
							margin-bottom: 5px;
							padding-left: 15px;
							padding-right: 15px;
						}

						.content {
							display: inline-block;
							padding: 10px 20px;
							background-color: #F3F3F3;
							border-radius: 999px;

							color: #333;
							font-size: 18px;
							line-height: 1.2em;
							text-align: left;
						}
					}

					&.current-user {
						margin-top: 30px;
						justify-content: flex-end;
						text-align: right;

						.message-inner {
							max-width: 75%;

							.content {
								color: #FFF;
								font-weight: 600;
								background-color: #ea526f;
							}
						}
					}
				}
			}

			footer {
				position: sticky;
				bottom: 0px;
				background-color: #FFF;
				padding: 30px;
				box-shadow: 0px 0px 12px rgba(100, 100, 100, 0.2);

				form {
					display: flex;

					input[type="text"] {
						flex: 1 1 100%;

						appearance: none;
						border: none;
						outline: none;
						background: none;

						display: block;
						width: 100%;
						padding: 10px 15px;
						border-radius: 8px 0px 0px 8px;
						
						color: #333;
						font-size: 18px;

						box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
						background-color: #F3F3F3;

						transition: 0.4s;

						&::placeholder {
							color: #888;
							transition: 0.4s;
						}
					}
					
					input[type="submit"] {
						appearance: none;
						border: none;
						outline: none;
						background: none;

						display: block;
						padding: 10px 15px;
						border-radius: 0px 8px 8px 0px;

						background-color: #ea526f;

						color: #FFF;
						font-size: 18px;
						font-weight: 700;
					}
				}
			}
		}
	}

	.btn {
	cursor: pointer;
	outline: 0;
	display: inline-block;
	font-weight: 400;
	line-height: 1.5;
	text-align: center;
	border: 1px solid #fff;
	padding: 6px 12px;
	font-size: 1rem;
	border-radius: 1.25rem;
	transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
	color: #0d6efd;
	border-color: #0d6efd;
	}

	.btn:hover {
	color: #fff;
	background-color: #0d6efd;
	border-color: #0d6efd;
	}

	.active {
	color: #fff;
	background-color: #0d6efd;
	border-color: #0d6efd;
	}

	#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	}

	@import'~bootstrap/dist/css/bootstrap.css'
</style>
  
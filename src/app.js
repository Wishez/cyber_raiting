import '../styles/index.scss';
import $ from 'jquery'
import {
    raitingListener
} from './raitingListener';
import {
    thumbsHandler
} from '../src/thumbsHandler'
import '../tests';

thumbsHandler.run();
raitingListener.initUsers();
raitingListener.listen();
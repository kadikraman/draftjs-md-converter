<pipeline>
  <job image="node:carbon">
    <Run command="yarn install" />
    <Run command="yarn lint" />
    <Run command="yarn test" />
  </job>
</pipeline>
